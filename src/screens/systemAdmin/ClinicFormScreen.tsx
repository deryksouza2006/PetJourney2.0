import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { useCreateClinic } from '../../hooks/clinics/useCreateClinic';
import { useUpdateClinic } from '../../hooks/clinics/useUpdateClinic';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { ClinicRequest } from '../../types/clinic';
import { getApiErrorMessage } from '../../utils/apiError';
import { isValidCnpj, isValidEmail } from '../../utils/formValidation';

type Props =
    | NativeStackScreenProps<SystemAdminStackParamList, 'CreateClinic'>
    | NativeStackScreenProps<SystemAdminStackParamList, 'EditClinic'>;

export function ClinicFormScreen(props: Props) {
    const { navigation, route } = props;
    const clinic = route.name === 'EditClinic' ? route.params.clinic : undefined;
    const isEditing = clinic !== undefined;
    const createClinic = useCreateClinic();
    const updateClinic = useUpdateClinic();
    const cnpjInputRef = useRef<TextInput>(null);
    const phoneInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const addressInputRef = useRef<TextInput>(null);
    const [name, setName] = useState(clinic?.name ?? '');
    const [cnpj, setCnpj] = useState(clinic?.cnpj ?? '');
    const [phone, setPhone] = useState(clinic?.phone ?? '');
    const [email, setEmail] = useState(clinic?.email ?? '');
    const [address, setAddress] = useState(clinic?.address ?? '');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isPending = createClinic.isPending || updateClinic.isPending;

    async function handleSubmit(): Promise<void> {
        const trimmedName = name.trim();
        const trimmedCnpj = cnpj.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedCnpj) {
            setErrorMessage('Nome e CNPJ são obrigatórios.');
            return;
        }

        if (!isValidCnpj(trimmedCnpj)) {
            setErrorMessage('Informe um CNPJ válido.');
            return;
        }

        if (trimmedEmail && !isValidEmail(trimmedEmail)) {
            setErrorMessage('Informe um e-mail válido.');
            return;
        }

        const request: ClinicRequest = { name: trimmedName, cnpj: trimmedCnpj };

        if (phone.trim()) {
            request.phone = phone.trim();
        }

        if (trimmedEmail) {
            request.email = trimmedEmail;
        }

        if (address.trim()) {
            request.address = address.trim();
        }

        setErrorMessage(null);

        try {
            if (clinic) {
                await updateClinic.mutateAsync({ id: clinic.id, request });
            } else {
                await createClinic.mutateAsync(request);
            }

            Alert.alert(
                isEditing ? 'Alterações salvas' : 'Cadastro concluído',
                isEditing
                    ? 'Clínica atualizada com sucesso.'
                    : 'Clínica cadastrada com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch (error: unknown) {
            const fallback =
                isEditing
                    ? 'Não foi possível atualizar a clínica. Verifique os dados.'
                    : 'Não foi possível cadastrar a clínica. Verifique os dados.';

            setErrorMessage(getApiErrorMessage(error, fallback));
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
                        <Text style={styles.eyebrow}>{isEditing ? 'EDIÇÃO' : 'NOVO CADASTRO'}</Text>
                        <Text style={styles.title}>
                            {isEditing ? 'Editar clínica' : 'Cadastrar clínica'}
                        </Text>
                        <Text style={styles.description}>
                            {isEditing
                                ? 'Atualize os dados cadastrais da clínica.'
                                : 'Informe os dados da clínica para adicioná-la à plataforma.'}
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Dados da clínica</Text>
                            <Text style={styles.requiredHint}>Nome e CNPJ são obrigatórios.</Text>

                            <View style={styles.fields}>
                                <AppInput
                                    label="Nome *"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nome da clínica"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => cnpjInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={cnpjInputRef}
                                    label="CNPJ *"
                                    value={cnpj}
                                    onChangeText={setCnpj}
                                    placeholder="CNPJ"
                                    keyboardType="numeric"
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
                                    onSubmitEditing={() => emailInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={emailInputRef}
                                    label="E-mail"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="nome@exemplo.com"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => addressInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={addressInputRef}
                                    label="Endereço"
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Endereço"
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
                                label={isEditing ? 'Salvar alterações' : 'Cadastrar clínica'}
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
    sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
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
        backgroundColor: '#FDF0F0',
    },
    error: { color: colors.danger, fontSize: typography.caption, lineHeight: 20 },
});
