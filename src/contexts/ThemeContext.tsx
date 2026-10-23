import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import {
    getThemePreference,
    saveThemePreference,
} from '../services/themeStorage';
import {
    darkThemeColors,
    lightThemeColors,
    setActiveThemeColors,
    ThemeColors,
} from '../theme/tokens';
import { ResolvedTheme, ThemePreference } from '../types/theme';

interface ThemeContextValue {
    themePreference: ThemePreference;
    resolvedTheme: ResolvedTheme;
    isDark: boolean;
    colors: ThemeColors;
    setThemePreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
    const systemTheme = useColorScheme();
    const [themePreference, setPreference] = useState<ThemePreference>('system');
    const [isLoading, setIsLoading] = useState(true);
    const resolvedTheme: ResolvedTheme = themePreference === 'system'
        ? systemTheme === 'dark' ? 'dark' : 'light'
        : themePreference;
    const themeColors = resolvedTheme === 'dark' ? darkThemeColors : lightThemeColors;

    setActiveThemeColors(themeColors);

    useEffect(() => {
        let isMounted = true;

        async function restorePreference(): Promise<void> {
            try {
                const savedPreference = await getThemePreference();

                if (isMounted) {
                    setPreference(savedPreference);
                }
            } catch {
                if (isMounted) {
                    setPreference('system');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void restorePreference();

        return () => {
            isMounted = false;
        };
    }, []);

    const setThemePreference = useCallback(async (
        preference: ThemePreference,
    ): Promise<void> => {
        setPreference(preference);

        try {
            await saveThemePreference(preference);
        } catch {
            // A preferência continua válida durante a sessão mesmo se a persistência falhar.
        }
    }, []);

    const value = useMemo<ThemeContextValue>(() => ({
        themePreference,
        resolvedTheme,
        isDark: resolvedTheme === 'dark',
        colors: themeColors,
        setThemePreference,
    }), [resolvedTheme, setThemePreference, themeColors, themePreference]);

    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: themeColors.background,
            }}>
                <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
        );
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}
