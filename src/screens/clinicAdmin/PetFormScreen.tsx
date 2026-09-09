import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
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
import { PaginationControls } from '../../components/PaginationControls';
import { useCreatePet } from '../../hooks/pets/useCreatePet';
import { useUpdatePet } from '../../hooks/pets/useUpdatePet';
import { useTutor } from '../../hooks/tutors/useTutor';
import { useTutors } from '../../hooks/tutors/useTutors';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { PetRequest, PetSex, PetSpecies } from '../../types/pet';
import { getApiErrorMessage } from '../../utils/apiError';
import { isValidIsoDate } from '../../utils/dateValidation';

type Props =
    | NativeStackScreenProps<ClinicAdminStackParamList, 'CreatePet'>
    | NativeStackScreenProps<ClinicAdminStackParamList, 'EditPet'>;

const SPECIES_OPTIONS: PetSpecies[] = [
    'CACHORRO',
    'GATO',
    'AVE',
    'ROEDOR',
    'REPTIL',
    'OUTRO',
];

const SEX_OPTIONS: PetSex[] = ['MACHO', 'FEMEA'];

export function PetFormScreen(props: Props) {
    const { navigation, route } = props;
    const pet = route.name === 'EditPet' ? route.params.pet : undefined;
    const isEditing = pet !== undefined;
    const createPet = useCreatePet();
    const updatePet = useUpdatePet();
    const [tutorPage, setTutorPage] = useState(0);
    const tutors = useTutors(tutorPage);
    const linkedTutor = useTutor(pet?.tutorId ?? null);
    const breedInputRef = useRef<TextInput>(null);
    const birthDateInputRef = useRef<TextInput>(null);
    const weightInputRef = useRef<TextInput>(null);
    const [name, setName] = useState(pet?.name ?? '');
    const [species, setSpecies] = useState<PetSpecies | null>(pet?.species ?? null);
    const [breed, setBreed] = useState(pet?.breed ?? '');
    const [sex, setSex] = useState<PetSex | null>(pet?.sex ?? null);
    const [birthDate, setBirthDate] = useState(pet?.birthDate ?? '');
    const [weight, setWeight] = useState(
        pet?.weight !== null && pet?.weight !== undefined
            ? pet.weight.toString()
            : '',
    );
    const [tutorId, setTutorId] = useState<number | null>(pet?.tutorId ?? null);
    const [selectedTutorName, setSelectedTutorName] = useState<string | null>(
        pet?.tutorName ?? null,
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isPending = createPet.isPending || updatePet.isPending;
    const displayedTutorName = tutorId === pet?.tutorId
        ? linkedTutor.data?.name ?? selectedTutorName
        : selectedTutorName;

    async function handleSubmit(): Promise<void> {
        const trimmedName = name.trim();

        if (!trimmedName || species === null || tutorId === null) {
            setErrorMessage('Nome, espécie e Tutor são obrigatórios.');
            return;
        }

        const request: PetRequest = {
            name: trimmedName,
            species,
            tutorId,
        };

        if (breed.trim()) {
            request.breed = breed.trim();
        }

        if (sex !== null) {
            request.sex = sex;
        }

        const trimmedBirthDate = birthDate.trim();

        if (trimmedBirthDate) {
            if (!isValidIsoDate(trimmedBirthDate)) {
                setErrorMessage('Informe uma data de nascimento válida no formato AAAA-MM-DD.');
                return;
            }

            request.birthDate = trimmedBirthDate;
        }

        if (weight.trim()) {
            const parsedWeight = Number(weight.trim().replace(',', '.'));

            if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
                setErrorMessage('O peso deve ser positivo.');
                return;
            }

            request.weight = parsedWeight;
        }

        setErrorMessage(null);

        try {
            if (pet) {
                await updatePet.mutateAsync({ id: pet.id, request });
            } else {
                await createPet.mutateAsync(request);
            }

            Alert.alert(
                isEditing ? 'Alterações salvas' : 'Cadastro concluído',
                isEditing
                    ? 'Pet atualizado com sucesso.'
                    : 'Pet cadastrado com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch (error: unknown) {
            const fallback =
                isEditing
                    ? 'Não foi possível atualizar o Pet. Verifique os dados.'
                    : 'Não foi possível cadastrar o Pet. Verifique os dados.';

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
                            {isEditing ? 'Editar pet' : 'Cadastrar pet'}
                        </Text>
                        <Text style={styles.description}>
                            {isEditing
                                ? 'Atualize os dados cadastrais do pet.'
                                : 'Informe os dados do pet para adicioná-lo à clínica.'}
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Dados do pet</Text>
                            <Text style={styles.requiredHint}>
                                Nome, espécie e Tutor são obrigatórios.
                            </Text>

                            <View style={styles.fields}>
                                <AppInput
                                    label="Nome *"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nome do pet"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => breedInputRef.current?.focus()}
                                />

                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Espécie *</Text>
                                    <View style={styles.options}>
                                        {SPECIES_OPTIONS.map((option) => (
                                            <Pressable
                                                key={option}
                                                accessibilityRole="button"
                                                accessibilityState={{
                                                    selected: species === option,
                                                    disabled: isPending,
                                                }}
                                                style={({ pressed }) => [
                                                    styles.option,
                                                    species === option && styles.optionSelected,
                                                    pressed && !isPending && styles.optionPressed,
                                                    isPending && styles.optionDisabled,
                                                ]}
                                                onPress={() => setSpecies(option)}
                                                disabled={isPending}
                                            >
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        species === option && styles.optionTextSelected,
                                                    ]}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                <AppInput
                                    ref={breedInputRef}
                                    label="Raça"
                                    value={breed}
                                    onChangeText={setBreed}
                                    placeholder="Raça (opcional)"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => birthDateInputRef.current?.focus()}
                                />

                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Sexo (opcional)</Text>
                                    <View style={styles.options}>
                                        {SEX_OPTIONS.map((option) => (
                                            <Pressable
                                                key={option}
                                                accessibilityRole="button"
                                                accessibilityState={{
                                                    selected: sex === option,
                                                    disabled: isPending,
                                                }}
                                                style={({ pressed }) => [
                                                    styles.option,
                                                    sex === option && styles.optionSelected,
                                                    pressed && !isPending && styles.optionPressed,
                                                    isPending && styles.optionDisabled,
                                                ]}
                                                onPress={() => setSex(option)}
                                                disabled={isPending}
                                            >
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        sex === option && styles.optionTextSelected,
                                                    ]}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        ))}
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityState={{
                                                selected: sex === null,
                                                disabled: isPending,
                                            }}
                                            style={({ pressed }) => [
                                                styles.option,
                                                sex === null && styles.optionSelected,
                                                pressed && !isPending && styles.optionPressed,
                                                isPending && styles.optionDisabled,
                                            ]}
                                            onPress={() => setSex(null)}
                                            disabled={isPending}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    sex === null && styles.optionTextSelected,
                                                ]}
                                            >
                                                Não informar
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>

                                <AppInput
                                    ref={birthDateInputRef}
                                    label="Nascimento"
                                    value={birthDate}
                                    onChangeText={setBirthDate}
                                    placeholder="AAAA-MM-DD (opcional)"
                                    autoCapitalize="none"
                                    editable={!isPending}
                                    returnKeyType="next"
                                    onSubmitEditing={() => weightInputRef.current?.focus()}
                                />
                                <AppInput
                                    ref={weightInputRef}
                                    label="Peso"
                                    value={weight}
                                    onChangeText={setWeight}
                                    placeholder="Peso em kg (opcional)"
                                    keyboardType="decimal-pad"
                                    editable={!isPending}
                                />

                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Tutor *</Text>
                                    {tutorId !== null ? (
                                        <View style={styles.selectedTutor}>
                                            <Text style={styles.selectedTutorLabel}>
                                                Tutor selecionado
                                            </Text>
                                            {linkedTutor.isPending && !displayedTutorName ? (
                                                <View style={styles.selectedTutorLoading}>
                                                    <ActivityIndicator
                                                        size="small"
                                                        color={colors.primary}
                                                    />
                                                    <Text style={styles.message}>
                                                        Carregando responsável...
                                                    </Text>
                                                </View>
                                            ) : (
                                                <Text style={styles.selectedTutorName}>
                                                    {displayedTutorName ?? `Tutor #${tutorId}`}
                                                </Text>
                                            )}
                                        </View>
                                    ) : null}
                                    {tutors.isPending ? (
                                        <View style={styles.tutorState}>
                                            <ActivityIndicator color={colors.primary} />
                                            <Text style={styles.message}>Carregando Tutores...</Text>
                                        </View>
                                    ) : tutors.isError ? (
                                        <View style={styles.selectionError}>
                                            <Text style={styles.error}>
                                                Não foi possível carregar os Tutores.
                                            </Text>
                                        </View>
                                    ) : (
                                        <>
                                            {tutors.data.content.length === 0 ? (
                                                <View style={styles.emptyTutors}>
                                                    <Text style={styles.message}>
                                                        Nenhum Tutor disponível.
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View style={styles.tutors}>
                                                    {tutors.data.content.map((tutor) => (
                                                        <Pressable
                                                            key={tutor.id}
                                                            accessibilityRole="button"
                                                            accessibilityState={{
                                                                selected: tutorId === tutor.id,
                                                                disabled: isPending,
                                                            }}
                                                            style={({ pressed }) => [
                                                                styles.tutorOption,
                                                                tutorId === tutor.id &&
                                                                    styles.optionSelected,
                                                                pressed &&
                                                                    !isPending &&
                                                                    styles.optionPressed,
                                                                isPending && styles.optionDisabled,
                                                            ]}
                                                            onPress={() => {
                                                                setTutorId(tutor.id);
                                                                setSelectedTutorName(tutor.name);
                                                            }}
                                                            disabled={isPending}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.optionText,
                                                                    tutorId === tutor.id &&
                                                                        styles.optionTextSelected,
                                                                ]}
                                                            >
                                                                {tutor.name}
                                                            </Text>
                                                        </Pressable>
                                                    ))}
                                                </View>
                                            )}
                                            <PaginationControls
                                                page={tutors.data.number}
                                                totalPages={tutors.data.totalPages}
                                                isFirst={tutors.data.first}
                                                isLast={tutors.data.last}
                                                disabled={tutors.isFetching || isPending}
                                                onPrevious={() =>
                                                    setTutorPage(tutors.data.number - 1)
                                                }
                                                onNext={() =>
                                                    setTutorPage(tutors.data.number + 1)
                                                }
                                            />
                                        </>
                                    )}
                                </View>
                            </View>

                            {errorMessage ? (
                                <View style={styles.errorContainer} accessibilityLiveRegion="polite">
                                    <Text style={styles.error}>{errorMessage}</Text>
                                </View>
                            ) : null}

                            <AppButton
                                label={isEditing ? 'Salvar alterações' : 'Cadastrar pet'}
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
    fields: { gap: spacing.xl, marginVertical: spacing.xl },
    fieldGroup: { gap: spacing.sm },
    label: {
        color: colors.text,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    option: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.sm,
        backgroundColor: colors.surface,
    },
    tutorOption: {
        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
    },
    optionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    optionPressed: { opacity: 0.75 },
    optionDisabled: { opacity: 0.6 },
    optionText: {
        color: colors.text,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    optionTextSelected: { color: colors.white },
    tutors: { gap: spacing.sm },
    selectedTutor: {
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
    },
    selectedTutorLabel: {
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    selectedTutorName: {
        marginTop: spacing.xs,
        color: colors.text,
        fontSize: typography.caption,
        fontWeight: '800',
    },
    selectedTutorLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    tutorState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
    },
    emptyTutors: {
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
    },
    selectionError: {
        padding: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
        borderRadius: radii.sm,
        backgroundColor: '#FDF0F0',
    },
    message: { color: colors.textSecondary, fontSize: typography.caption, lineHeight: 20 },
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
