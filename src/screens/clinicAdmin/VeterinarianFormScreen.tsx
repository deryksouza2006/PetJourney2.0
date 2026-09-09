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
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { VeterinarianRequest } from '../../types/veterinarian';
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
    const isPending = createVeterinarian.isPending || updateVeterinarian.isPending;

    async function handleSubmit(): Promise<void> {
        const trimmedName = name.trim();
        const trimmedCrmv = crmv.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedCrmv) {
            setErrorMessage('Nome e CRMV são obrigatórios.');
            return;
        }

        if (trimmedEmail && !isValidEmail(trimmedEmail)) {
            setErrorMessage('Informe um e-mail válido.');
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
        } catch {
            setErrorMessage(
                isEditing
                    ? 'Não foi possível atualizar o veterinário. Verifique os dados.'
                    : 'Não foi possível cadastrar o veterinário. Verifique os dados.',
            );
        }
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
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
                                    onChangeText={setName}
                                    placeholder="Nome do veterinário"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => crmvInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={crmvInputRef}
                                    label="CRMV *"
                                    value={crmv}
                                    onChangeText={setCrmv}
                                    placeholder="CRMV"
                                    autoCapitalize="characters"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => phoneInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={phoneInputRef}
                                    label="Telefone"
                                    value={phone}
                                    onChangeText={setPhone}
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
                                <View style={styles.emailField}>
                                    <AppInput
                                        ref={emailInputRef}
                                        label="E-mail"
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="nome@exemplo.com"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="email-address"
                                        editable={!isEditing && !isPending}
                                        returnKeyType="next"
                                        style={isEditing ? styles.readOnlyInput : undefined}
                                        onSubmitEditing={() => specialtyInputRef.current?.focus()}
                                    />
                                    {isEditing ? (
                                        <Text style={styles.readOnlyHint}>
                                            O e-mail não pode ser alterado na edição.
                                        </Text>
                                    ) : null}
                                </View>
                                <AppInput
                                    ref={specialtyInputRef}
                                    label="Especialidade"
                                    value={specialty}
                                    onChangeText={setSpecialty}
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
                            />
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
    emailField: { gap: spacing.sm },
    readOnlyInput: { backgroundColor: colors.background, color: colors.textSecondary },
    readOnlyHint: {
        color: colors.textSecondary,
        fontSize: typography.small,
        lineHeight: 18,
    },
    errorContainer: {
        marginBottom: spacing.lg,
        padding: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
        borderRadius: radii.sm,
        backgroundColor: '#FDF0F0',
    },
    error: { color: colors.danger, fontSize: typography.caption, lineHeight: 20 },
});
