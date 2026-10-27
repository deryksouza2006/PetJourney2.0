import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
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
import { colors, createThemedStyles, radii, shadows, spacing, typography } from '../../theme/tokens';
import { FirstAccessRequest } from '../../types/auth';
import { getApiErrorMessage } from '../../utils/apiError';
import { isValidEmail } from '../../utils/formValidation';

type Props = NativeStackScreenProps<AuthStackParamList, 'FirstAccess'>;

export function FirstAccessScreen({ navigation }: Props) {
    const firstAccess = useFirstAccess();
    const codeInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

    async function handleActivate(): Promise<void> {
        const username = email.trim();
        const trimmedCode = code.trim();

        const nextEmailError = !username
            ? 'Informe o e-mail.'
            : !isValidEmail(username)
                ? 'Informe um e-mail válido.'
                : null;
        const nextCodeError = !trimmedCode
            ? 'Informe o código recebido.'
            : !/^\d{6}$/.test(trimmedCode)
                ? 'O código deve conter exatamente 6 dígitos.'
                : null;
        const nextPasswordError = !password
            ? 'Informe a nova senha.'
            : password.length < 6
                ? 'A senha deve ter pelo menos 6 caracteres.'
                : null;
        const nextConfirmPasswordError = !confirmPassword
            ? 'Confirme a nova senha.'
            : confirmPassword !== password
                ? 'As senhas não coincidem.'
                : null;

        setEmailError(nextEmailError);
        setCodeError(nextCodeError);
        setPasswordError(nextPasswordError);
        setConfirmPasswordError(nextConfirmPasswordError);

        if (
            nextEmailError
            || nextCodeError
            || nextPasswordError
            || nextConfirmPasswordError
        ) {
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
        } catch (error: unknown) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível ativar a conta. Verifique o e-mail, o código e a nova senha.',
                ),
            );
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
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
                                    onChangeText={(value) => {
                                        setEmail(value);
                                        setEmailError(null);
                                        setErrorMessage(null);
                                    }}
                                    error={emailError}
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
                                    onChangeText={(value) => {
                                        setCode(value.replace(/\D/g, ''));
                                        setCodeError(null);
                                        setErrorMessage(null);
                                    }}
                                    error={codeError}
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
                                    onChangeText={(value) => {
                                        setPassword(value);
                                        setPasswordError(null);
                                        setConfirmPasswordError(null);
                                        setErrorMessage(null);
                                    }}
                                    error={passwordError}
                                    helperText="Use pelo menos 6 caracteres."
                                    placeholder="Mínimo de 6 caracteres"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    secureTextEntry
                                    showPasswordToggle
                                    returnKeyType="next"
                                    editable={!firstAccess.isPending}
                                    onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={confirmPasswordInputRef}
                                    label="Confirmar nova senha"
                                    value={confirmPassword}
                                    onChangeText={(value) => {
                                        setConfirmPassword(value);
                                        setConfirmPasswordError(null);
                                        setErrorMessage(null);
                                    }}
                                    error={confirmPasswordError}
                                    placeholder="Digite a senha novamente"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    secureTextEntry
                                    showPasswordToggle
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
                                loadingLabel="Ativando..."
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

const styles = createThemedStyles((colors) => ({
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
        backgroundColor: colors.errorSurface,
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
}));
