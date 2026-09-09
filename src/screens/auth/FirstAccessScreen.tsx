import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { BrandMark } from '../../components/BrandMark';
import { useFirstAccess } from '../../hooks/auth/useFirstAccess';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { FirstAccessRequest } from '../../types/auth';
import { isValidEmail } from '../../utils/formValidation';

type Props = NativeStackScreenProps<AuthStackParamList, 'FirstAccess'>;

export function FirstAccessScreen({ navigation }: Props) {
    const firstAccess = useFirstAccess();
    const codeInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleActivate(): Promise<void> {
        const username = email.trim();
        const trimmedCode = code.trim();

        if (!username || !trimmedCode || !password.trim()) {
            setErrorMessage('E-mail, código e nova senha são obrigatórios.');
            return;
        }

        if (!isValidEmail(username)) {
            setErrorMessage('Informe um e-mail válido.');
            return;
        }

        if (!/^\d{6}$/.test(trimmedCode)) {
            setErrorMessage('O código de primeiro acesso deve conter exatamente 6 dígitos.');
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
                'Primeiro acesso concluído. Entre com seu e-mail e a nova senha.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch {
            setErrorMessage(
                'Não foi possível ativar a conta. Verifique o e-mail, o código e a nova senha.',
            );
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.wrapper}>
                        <View style={styles.brandArea}>
                            <BrandMark />
                            <Text style={styles.welcome}>Ative seu acesso ao PetJourney.</Text>
                            <Text style={styles.introduction}>
                                Use o código temporário recebido e crie uma senha segura.
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.title}>Primeiro acesso</Text>
                            <Text style={styles.subtitle}>
                                Confirme seus dados para ativar sua conta.
                            </Text>

                            <View style={styles.fields}>
                                <AppInput
                                    label="E-mail"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="nome@exemplo.com"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    editable={!firstAccess.isPending}
                                    onSubmitEditing={() => codeInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={codeInputRef}
                                    label="Código de primeiro acesso"
                                    value={code}
                                    onChangeText={setCode}
                                    placeholder="Digite o código recebido"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    returnKeyType="next"
                                    editable={!firstAccess.isPending}
                                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={passwordInputRef}
                                    label="Nova senha"
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Mínimo de 6 caracteres"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    secureTextEntry
                                    returnKeyType="done"
                                    editable={!firstAccess.isPending}
                                    onSubmitEditing={() => void handleActivate()}
                                />
                            </View>

                            {errorMessage ? (
                                <View style={styles.errorContainer} accessibilityLiveRegion="polite">
                                    <Text style={styles.error}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            <AppButton
                                label="Ativar conta"
                                onPress={() => void handleActivate()}
                                loading={firstAccess.isPending}
                            />

                            <View style={styles.backArea}>
                                <Text style={styles.backPrompt}>Já ativou sua conta?</Text>
                                <Pressable
                                    accessibilityRole="button"
                                    style={({ pressed }) => [
                                        styles.backButton,
                                        pressed && styles.backButtonPressed,
                                    ]}
                                    onPress={() => navigation.goBack()}
                                    disabled={firstAccess.isPending}
                                >
                                    <Text style={styles.backButtonText}>Voltar para o login</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    keyboardView: { flex: 1 },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxl,
    },
    wrapper: { width: '100%', maxWidth: 480, alignSelf: 'center' },
    brandArea: { marginBottom: spacing.xxl },
    welcome: {
        marginTop: spacing.xl,
        color: colors.text,
        fontSize: typography.display,
        fontWeight: '800',
        lineHeight: 38,
        letterSpacing: -1,
    },
    introduction: {
        marginTop: spacing.md,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 24,
    },
    card: {
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    title: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    subtitle: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    fields: { marginTop: spacing.xl, marginBottom: spacing.lg, gap: spacing.lg },
    errorContainer: {
        marginBottom: spacing.lg,
        padding: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
        borderRadius: radii.sm,
        backgroundColor: '#FDF0F0',
    },
    error: { color: colors.danger, fontSize: typography.caption, lineHeight: 20 },
    backArea: { alignItems: 'center', marginTop: spacing.xl },
    backPrompt: { color: colors.textSecondary, fontSize: typography.caption },
    backButton: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
    },
    backButtonPressed: { opacity: 0.65 },
    backButtonText: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
});
