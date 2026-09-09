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
import { useCreateTutor } from '../../hooks/tutors/useCreateTutor';
import { useUpdateTutor } from '../../hooks/tutors/useUpdateTutor';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { TutorRequest } from '../../types/tutor';
import { getApiErrorMessage } from '../../utils/apiError';

type Props =
    | NativeStackScreenProps<ClinicAdminStackParamList, 'CreateTutor'>
    | NativeStackScreenProps<ClinicAdminStackParamList, 'EditTutor'>;

export function TutorFormScreen(props: Props) {
    const { navigation, route } = props;
    const tutor = route.name === 'EditTutor' ? route.params.tutor : undefined;
    const isEditing = tutor !== undefined;
    const createTutor = useCreateTutor();
    const updateTutor = useUpdateTutor();
    const cpfInputRef = useRef<TextInput>(null);
    const phoneInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const [name, setName] = useState(tutor?.name ?? '');
    const [cpf, setCpf] = useState(tutor?.cpf ?? '');
    const [phone, setPhone] = useState(tutor?.phone ?? '');
    const [email, setEmail] = useState(tutor?.email ?? '');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isPending = createTutor.isPending || updateTutor.isPending;

    async function handleSubmit(): Promise<void> {
        const trimmedName = name.trim();
        const trimmedCpf = cpf.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedCpf) {
            setErrorMessage('Nome e CPF são obrigatórios.');
            return;
        }

        if (!/^\d{11}$/.test(trimmedCpf)) {
            setErrorMessage('O CPF deve conter 11 dígitos.');
            return;
        }

        if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            setErrorMessage('Informe um e-mail válido.');
            return;
        }

        const request: TutorRequest = {
            name: trimmedName,
            cpf: trimmedCpf,
        };

        if (phone.trim()) {
            request.phone = phone.trim();
        }

        if (trimmedEmail) {
            request.email = trimmedEmail;
        }

        setErrorMessage(null);

        try {
            if (tutor) {
                await updateTutor.mutateAsync({ id: tutor.id, request });
            } else {
                await createTutor.mutateAsync(request);
            }

            Alert.alert(
                isEditing ? 'Alterações salvas' : 'Cadastro concluído',
                isEditing
                    ? 'Tutor atualizado com sucesso.'
                    : 'Tutor cadastrado com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch (error: unknown) {
            const fallback =
                isEditing
                    ? 'Não foi possível atualizar o tutor. Verifique os dados.'
                    : 'Não foi possível cadastrar o tutor. Verifique os dados.';

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
                        <Text style={styles.eyebrow}>
                            {isEditing ? 'EDIÇÃO' : 'NOVO CADASTRO'}
                        </Text>
                        <Text style={styles.title}>
                            {isEditing ? 'Editar tutor' : 'Cadastrar tutor'}
                        </Text>
                        <Text style={styles.description}>
                            {isEditing
                                ? 'Atualize os dados cadastrais do tutor.'
                                : 'Informe os dados do responsável para adicioná-lo à clínica.'}
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Dados do tutor</Text>
                            <Text style={styles.requiredHint}>Nome e CPF são obrigatórios.</Text>

                            <View style={styles.fields}>
                                <AppInput
                                    label="Nome *"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nome do tutor"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => cpfInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={cpfInputRef}
                                    label="CPF *"
                                    value={cpf}
                                    onChangeText={setCpf}
                                    placeholder="CPF (11 dígitos)"
                                    keyboardType="number-pad"
                                    maxLength={11}
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
                                label={isEditing ? 'Salvar alterações' : 'Cadastrar tutor'}
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
