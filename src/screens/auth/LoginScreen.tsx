import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
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
import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
    const { signIn } = useAuth();
    const passwordInputRef = useRef<TextInput>(null);
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
            await signIn({ username: email.trim(), password });
        } catch {
            setErrorMessage('Não foi possível entrar. Verifique suas credenciais.');
        } finally {
            setIsSubmitting(false);
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
                            <Text style={styles.welcome}>Cuidado conectado, jornada tranquila.</Text>
                            <Text style={styles.introduction}>
                                Acesse sua rotina veterinária com segurança e praticidade.
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.title}>Bem-vindo</Text>
                            <Text style={styles.subtitle}>Entre com seus dados para continuar.</Text>

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
                                    editable={!isSubmitting}
                                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={passwordInputRef}
                                    label="Senha"
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Digite sua senha"
                                    autoCapitalize="none"
                                    autoComplete="current-password"
                                    secureTextEntry
                                    returnKeyType="done"
                                    editable={!isSubmitting}
                                    onSubmitEditing={() => void handleSignIn()}
                                />
                            </View>

                            {errorMessage ? (
                                <View style={styles.errorContainer} accessibilityLiveRegion="polite">
                                    <Text style={styles.error}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            <AppButton
                                label="Entrar"
                                onPress={() => void handleSignIn()}
                                loading={isSubmitting}
                            />

                            <View style={styles.firstAccessArea}>
                                <Text style={styles.firstAccessPrompt}>Recebeu um código de acesso?</Text>
                                <Pressable
                                    accessibilityRole="button"
                                    style={({ pressed }) => [
                                        styles.firstAccessButton,
                                        pressed && styles.firstAccessButtonPressed,
                                    ]}
                                    onPress={() => navigation.navigate('FirstAccess')}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.firstAccessButtonText}>Primeiro acesso</Text>
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
    firstAccessArea: { alignItems: 'center', marginTop: spacing.xl },
    firstAccessPrompt: { color: colors.textSecondary, fontSize: typography.caption },
    firstAccessButton: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
    },
    firstAccessButtonPressed: { opacity: 0.65 },
    firstAccessButtonText: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
});
