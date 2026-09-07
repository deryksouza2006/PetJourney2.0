import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleSignIn(): Promise<void> {
        if (!email.trim() || !password) {
            setErrorMessage('Informe o e-mail e a senha.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await signIn({
                username: email.trim(),
                password,
            });
        } catch {
            setErrorMessage('N�o foi poss�vel entrar. Verifique suas credenciais.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>PetJourney</Text>
                <Text style={styles.subtitle}>Acesso � cl�nica veterin�ria</Text>

                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="E-mail"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!isSubmitting}
                />

                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Senha"
                    secureTextEntry
                    editable={!isSubmitting}
                    onSubmitEditing={() => void handleSignIn()}
                />

                {errorMessage ? (
                    <Text style={styles.error}>{errorMessage}</Text>
                ) : null}

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        isSubmitting && styles.buttonDisabled,
                    ]}
                    onPress={() => void handleSignIn()}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Entrar</Text>
                    )}
                </Pressable>

                <Pressable
                    style={styles.firstAccessButton}
                    onPress={() => navigation.navigate('FirstAccess')}
                    disabled={isSubmitting}
                >
                    <Text style={styles.firstAccessButtonText}>
                        Primeiro acesso
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f4f8f7',
    },
    card: {
        padding: 24,
        borderRadius: 12,
        backgroundColor: '#ffffff',
    },
    title: {
        color: '#173f37',
        fontSize: 30,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 6,
        marginBottom: 24,
        color: '#5b6f6b',
        fontSize: 16,
        textAlign: 'center',
    },
    input: {
        height: 48,
        marginBottom: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#b8c9c5',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        fontSize: 16,
    },
    error: {
        marginBottom: 14,
        color: '#b42318',
        textAlign: 'center',
    },
    button: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#2f7d6d',
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    firstAccessButton: {
        marginTop: 16,
        padding: 8,
        alignItems: 'center',
    },
    firstAccessButtonText: {
        color: '#2f7d6d',
        fontSize: 16,
        fontWeight: '600',
    },
});
