import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { useCreateClinicAdmin } from '../../hooks/clinicAdmins/useCreateClinicAdmin';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { colors, createThemedStyles, radii, shadows, spacing, typography } from '../../theme/tokens';
import { ClinicAdminRequest } from '../../types/clinicAdmin';
import { getApiErrorMessage } from '../../utils/apiError';
import { isValidEmail } from '../../utils/formValidation';

type Props = NativeStackScreenProps<
    SystemAdminStackParamList,
    'CreateClinicAdmin'
>;

export function ClinicAdminFormScreen({ navigation, route }: Props) {
    const createClinicAdmin = useCreateClinicAdmin();
    const passwordInputRef = useRef<TextInput>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    async function handleSubmit(): Promise<void> {
        const username = email.trim();

        const nextEmailError = !username
            ? 'Informe o e-mail.'
            : !isValidEmail(username)
                ? 'Informe um e-mail válido.'
                : null;
        const nextPasswordError = !password
            ? 'Informe a senha.'
            : password.length < 6
                ? 'A senha deve ter pelo menos 6 caracteres.'
                : null;

        setEmailError(nextEmailError);
        setPasswordError(nextPasswordError);

        if (nextEmailError || nextPasswordError) {
            return;
        }

        const request: ClinicAdminRequest = {
            username,
            password,
        };

        setErrorMessage(null);

        try {
            await createClinicAdmin.mutateAsync({
                clinicId: route.params.clinicId,
                request,
            });
            Alert.alert(
                'Administrador criado',
                'Administrador da cl\u00ednica criado com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                setErrorMessage('Esta clínica já possui um administrador.');
                return;
            }

            setErrorMessage(
                getApiErrorMessage(
                    error,
                    'N\u00e3o foi poss\u00edvel criar o administrador. Verifique os dados informados.',
                ),
            );
        }
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.wrapper}>
                        <Text style={styles.eyebrow}>NOVO ACESSO</Text>
                        <Text style={styles.title}>Criar administrador</Text>
                        <Text style={styles.description}>
                            Defina as credenciais do administrador responsável pela clínica.
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Dados de acesso</Text>
                            <Text style={styles.requiredHint}>
                                E-mail e senha são obrigatórios.
                            </Text>

                            <View style={styles.clinicSummary}>
                                <Text style={styles.clinicLabel}>Clínica selecionada</Text>
                                <Text style={styles.clinicName}>{route.params.clinicName}</Text>
                            </View>

                            <View style={styles.fields}>
                                <AppInput
                                    label="E-mail *"
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
                                    editable={!createClinicAdmin.isPending}
                                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={passwordInputRef}
                                    label="Senha *"
                                    value={password}
                                    onChangeText={(value) => {
                                        setPassword(value);
                                        setPasswordError(null);
                                        setErrorMessage(null);
                                    }}
                                    error={passwordError}
                                    helperText="Use pelo menos 6 caracteres."
                                    placeholder="Mínimo de 6 caracteres"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    secureTextEntry
                                    showPasswordToggle
                                    returnKeyType="done"
                                    editable={!createClinicAdmin.isPending}
                                    onSubmitEditing={() => void handleSubmit()}
                                />
                            </View>

                            {errorMessage ? (
                                <View style={styles.errorContainer} accessibilityLiveRegion="polite">
                                    <Text style={styles.error}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            <AppButton
                                label="Criar administrador"
                                onPress={() => void handleSubmit()}
                                loading={createClinicAdmin.isPending}
                                loadingLabel="Criando..."
                            />
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
    scrollView: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: spacing.xl },
    wrapper: { width: '100%', maxWidth: 640, alignSelf: 'center' },
    eyebrow: {
        marginBottom: spacing.sm,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.4,
    },
    title: {
        color: colors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    description: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 23,
    },
    card: {
        marginTop: spacing.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: typography.heading,
        fontWeight: '800',
    },
    requiredHint: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
    },
    clinicSummary: {
        marginTop: spacing.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
    },
    clinicLabel: {
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clinicName: {
        marginTop: spacing.xs,
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '800',
    },
    fields: { gap: spacing.lg, marginVertical: spacing.xl },
    errorContainer: {
        marginBottom: spacing.lg,
        padding: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
        borderRadius: radii.sm,
        backgroundColor: colors.errorSurface,
    },
    error: { color: colors.danger, fontSize: typography.caption, lineHeight: 20 },
}));
