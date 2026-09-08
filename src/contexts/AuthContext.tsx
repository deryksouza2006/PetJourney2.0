import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { getMe, login } from '../services/authService';
import { getToken, removeToken, saveToken } from '../services/tokenStorage';
import { AuthSession, AuthUser, LoginRequest } from '../types/auth';

interface AuthContextValue {
    user: AuthUser | null;
    session: AuthSession | null;
    isLoading: boolean;
    signIn: (credentials: LoginRequest) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isInvalidSessionError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    return error.response?.status === 401 || error.response?.status === 403;
}

export function AuthProvider({ children }: PropsWithChildren) {
    const queryClient = useQueryClient();
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const clearSessionCache = useCallback(async (): Promise<void> => {
        await queryClient.cancelQueries({}, { silent: true });
        queryClient.clear();
    }, [queryClient]);

    useEffect(() => {
        let isMounted = true;

        async function restoreSession(): Promise<void> {
            try {
                const token = await getToken();

                if (!token) {
                    return;
                }

                try {
                    const user = await getMe();

                    if (isMounted) {
                        setSession({ token, user });
                    }
                } catch (error: unknown) {
                    if (isInvalidSessionError(error)) {
                        await clearSessionCache();
                        await removeToken();
                    }
                }
            } catch {
                // Keep the app usable if secure storage is temporarily unavailable.
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void restoreSession();

        return () => {
            isMounted = false;
        };
    }, [clearSessionCache]);

    const signIn = useCallback(async (credentials: LoginRequest): Promise<void> => {
        const loginResponse = await login(credentials);
        await saveToken(loginResponse.token);

        try {
            const user = await getMe();
            await clearSessionCache();
            setSession({ token: loginResponse.token, user });
        } catch (error: unknown) {
            if (isInvalidSessionError(error)) {
                await removeToken();
            }

            throw error;
        }
    }, [clearSessionCache]);

    const signOut = useCallback(async (): Promise<void> => {
        setSession(null);
        await clearSessionCache();
        await removeToken();
    }, [clearSessionCache]);

    const value = useMemo<AuthContextValue>(() => ({
        user: session?.user ?? null,
        session,
        isLoading,
        signIn,
        signOut,
    }), [isLoading, session, signIn, signOut]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
