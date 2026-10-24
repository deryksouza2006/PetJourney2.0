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
import { useAuth } from '../../contexts/AuthContext';
import { useCreateVeterinarian } from '../../hooks/veterinarians/useCreateVeterinarian';
import { useUpdateVeterinarian } from '../../hooks/veterinarians/useUpdateVeterinarian';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { colors, createThemedStyles, radii, shadows, spacing, typography } from '../../theme/tokens';
import { VeterinarianRequest } from '../../types/veterinarian';
import { getApiErrorMessage } from '../../utils/apiError';
import { isValidEmail } from '../../utils/formValidation';

type Props =
    | NativeStackScreenProps<ClinicAdminStackParamList, 'CreateVeterinarian'>
    | NativeStackScreenProps<ClinicAdminStackParamList, 'EditVeterinarian'>;

export function VeterinarianFormScreen(props: Props) {
    const { navigation, route } = props;
    const veterinarian =
        route.name === 'EditVeterinarian' ? route.params.veterinarian : undefined;
    const isEditing = veterinarian !== undefined;
    const { user } = useAuth();
    const createVeterinarian = useCreateVeterinarian();
    const updateVeterinarian = useUpdateVeterinarian();
    const crmvInputRef = useRef<TextInput>(null);
    const phoneInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const specialtyInputRef = useRef<TextInput>(null);
    const [name, setName] = useState(veterinarian?.name ?? '');
    const [crmv, setCrmv] = useState(veterinarian?.crmv ?? '');
    const [phone, setPhone] = useState(veterinarian?.phone ?? '');
    const [email, setEmail] = useState(veterinarian?.email ?? '');
    const [specialty, setSpecialty] = useState(veterinarian?.specialty ?? '');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [crmvError, setCrmvError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const isPending = createVeterinarian.isPending || updateVeterinarian.isPending;

    async function handleSubmit(): Promise<void> {
        const trimmedName = name.trim();
        const trimmedCrmv = crmv.trim();
        const trimmedEmail = email.trim();

        const nextNameError = trimmedName ? null : 'Informe o nome do veterinário.';
        const nextCrmvError = trimmedCrmv ? null : 'Informe o CRMV.';
        const nextEmailError = trimmedEmail && !isValidEmail(trimmedEmail)
            ? 'Informe um e-mail válido.'
            : null;

        setNameError(nextNameError);
        setCrmvError(nextCrmvError);
        setEmailError(nextEmailError);

        if (nextNameError || nextCrmvError || nextEmailError) {
            return;
        }

        if (user?.clinicId == null) {
            setErrorMessage('Não foi possível identificar a clínica da sessão.');
            return;
        }

        const request: VeterinarianRequest = {
            name: trimmedName,
            crmv: trimmedCrmv,
            clinicId: user.clinicId,
        };

        if (phone.trim()) {
            request.phone = phone.trim();
        }

        if (isEditing && veterinarian.email !== null) {
            request.email = veterinarian.email;
        } else if (!isEditing && trimmedEmail) {
            request.email = trimmedEmail;
        }

        if (specialty.trim()) {
            request.specialty = specialty.trim();
        }

        setErrorMessage(null);

        try {
            if (veterinarian) {
                await updateVeterinarian.mutateAsync({
                    id: veterinarian.id,
                    request,
                });
            } else {
                await createVeterinarian.mutateAsync(request);
            }

            Alert.alert(
                isEditing ? 'Alterações salvas' : 'Cadastro concluído',
                isEditing
                    ? 'Veterinário atualizado com sucesso.'
                    : 'Veterinário cadastrado com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch (error: unknown) {
            const fallback =
                isEditing
                    ? 'Não foi possível atualizar o veterinário. Verifique os dados.'
                    : 'Não foi possível cadastrar o veterinário. Verifique os dados.';

            setErrorMessage(getApiErrorMessage(error, fallback));
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
                        <Text style={styles.eyebrow}>
                            {isEditing ? 'EDIÇÃO' : 'NOVO CADASTRO'}
                        </Text>
                        <Text style={styles.title}>
                            {isEditing ? 'Editar veterinário' : 'Cadastrar veterinário'}
                        </Text>
                        <Text style={styles.description}>
                            {isEditing
                                ? 'Atualize os dados profissionais do veterinário.'
                                : 'Informe os dados do profissional para adicioná-lo à clínica.'}
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Dados do veterinário</Text>
                            <Text style={styles.requiredHint}>Nome e CRMV são obrigatórios.</Text>

                            <View style={styles.fields}>
                                <AppInput
                                    label="Nome *"
                                    value={name}
                                    onChangeText={(value) => {
                                        setName(value);
                                        setNameError(null);
                                        setErrorMessage(null);
                                    }}
                                    error={nameError}
                                    placeholder="Nome do veterinário"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => crmvInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={crmvInputRef}
                                    label="CRMV *"
                                    value={crmv}
                                    onChangeText={(value) => {
                                        setCrmv(value);
                                        setCrmvError(null);
                                        setErrorMessage(null);
                                    }}
                                    error={crmvError}
                                    placeholder="Ex.: CRMV-SP 12345"
                                    autoCapitalize="characters"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => phoneInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={phoneInputRef}
                                    label="Telefone"
                                    value={phone}
                                    onChangeText={(value) => {
                                        setPhone(value);
                                        setErrorMessage(null);
                                    }}
                                    placeholder="Telefone"
                                    keyboardType="phone-pad"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() =>
                                        isEditing
                                            ? specialtyInputRef.current?.focus()
                                            : emailInputRef.current?.focus()
                                    }
                                />
                                <AppInput
                                    ref={emailInputRef}
                                    label="E-mail"
                                    value={email}
                                    onChangeText={(value) => {
                                        setEmail(value);
                                        setEmailError(null);
                                        setErrorMessage(null);
                                    }}
                                    error={emailError}
                                    helperText={isEditing
                                        ? 'O e-mail não pode ser alterado na edição.'
                                        : undefined}
                                    placeholder="nome@exemplo.com"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    editable={!isEditing && !isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => specialtyInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={specialtyInputRef}
                                    label="Especialidade"
                                    value={specialty}
                                    onChangeText={(value) => {
                                        setSpecialty(value);
                                        setErrorMessage(null);
                                    }}
                                    placeholder="Especialidade"
                                    editable={!isPending}
                                    returnKeyType="done"
                                    onSubmitEditing={() => void handleSubmit()}
                                />
                            </View>

                            {errorMessage ? (
                                <View style={styles.errorContainer} accessibilityLiveRegion="polite">
                                    <Text style={styles.error}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            <AppButton
                                label={isEditing ? 'Salvar alterações' : 'Cadastrar veterinário'}
                                onPress={() => void handleSubmit()}
                                loading={isPending}
                                loadingLabel={isEditing ? 'Salvando...' : 'Cadastrando...'}
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
