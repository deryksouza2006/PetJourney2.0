import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from 'react-native';
import { useFirstAccess } from '../../hooks/auth/useFirstAccess';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { FirstAccessRequest } from '../../types/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'FirstAccess'>;

export function FirstAccessScreen({ navigation }: Props) {
    const firstAccess = useFirstAccess();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleActivate(): Promise<void> {
        const username = email.trim();
        const trimmedCode = code.trim();

        if (!username || !trimmedCode || !password.trim()) {
            setErrorMessage('E-mail, c\u00f3digo e nova senha s\u00e3o obrigat\u00f3rios.');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        const request: FirstAccessRequest = {
            username,
            code: trimmedCode,
            password,
        };

        setErrorMessage(null);

        try {
            await firstAccess.mutateAsync(request);
            Alert.alert(
                'Conta ativada',
                'Primeiro acesso conclu\u00eddo. Entre com seu e-mail e a nova senha.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch {
            setErrorMessage(
                'N\u00e3o foi poss\u00edvel ativar a conta. Verifique o e-mail, o c\u00f3digo e a nova senha.',
            );
        }
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Primeiro acesso</Text>
            <Text style={styles.subtitle}>
                Informe o c\u00f3digo tempor\u00e1rio e defina sua senha.
            </Text>

            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!firstAccess.isPending}
            />
            <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="C\u00f3digo tempor\u00e1rio"
                keyboardType="numeric"
                editable={!firstAccess.isPending}
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Nova senha"
                secureTextEntry
                editable={!firstAccess.isPending}
                onSubmitEditing={() => void handleActivate()}
            />

            {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    firstAccess.isPending && styles.buttonDisabled,
                ]}
                onPress={() => void handleActivate()}
                disabled={firstAccess.isPending}
            >
                {firstAccess.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Ativar conta</Text>
                )}
            </Pressable>

            <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                disabled={firstAccess.isPending}
            >
                <Text style={styles.backButtonText}>Voltar para o login</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f8f7',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
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
    backButton: {
        marginTop: 16,
        padding: 8,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#2f7d6d',
        fontSize: 16,
        fontWeight: '600',
    },
});
