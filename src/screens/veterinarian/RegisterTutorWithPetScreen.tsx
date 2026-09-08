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
import { useRegisterTutorWithPet } from '../../hooks/workflows/useRegisterTutorWithPet';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { PetSex, PetSpecies } from '../../types/pet';
import { RegisterTutorWithPetRequest } from '../../types/workflow';

type Props = NativeStackScreenProps<VeterinarianStackParamList, 'RegisterTutorWithPet'>;

const SPECIES_OPTIONS: PetSpecies[] = [
    'CACHORRO',
    'GATO',
    'AVE',
    'ROEDOR',
    'REPTIL',
    'OUTRO',
];

const SEX_OPTIONS: PetSex[] = ['MACHO', 'FEMEA'];

export function RegisterTutorWithPetScreen({ navigation }: Props) {
    const registerTutorWithPet = useRegisterTutorWithPet();
    const cpfInputRef = useRef<TextInput>(null);
    const phoneInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const petNameInputRef = useRef<TextInput>(null);
    const breedInputRef = useRef<TextInput>(null);
    const birthDateInputRef = useRef<TextInput>(null);
    const weightInputRef = useRef<TextInput>(null);
    const [tutorName, setTutorName] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [petName, setPetName] = useState('');
    const [species, setSpecies] = useState<PetSpecies | null>(null);
    const [breed, setBreed] = useState('');
    const [sex, setSex] = useState<PetSex | null>(null);
    const [birthDate, setBirthDate] = useState('');
    const [weight, setWeight] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleSubmit(): Promise<void> {
        const trimmedTutorName = tutorName.trim();
        const trimmedCpf = cpf.trim();
        const trimmedEmail = email.trim();
        const trimmedPetName = petName.trim();

        if (!trimmedTutorName || !trimmedCpf) {
            setErrorMessage('Nome e CPF do Tutor são obrigatórios.');
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

        if (!trimmedPetName || species === null) {
            setErrorMessage('Nome e espécie do Pet são obrigatórios.');
            return;
        }

        const trimmedBirthDate = birthDate.trim();

        if (trimmedBirthDate && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedBirthDate)) {
            setErrorMessage('Use o formato AAAA-MM-DD para o nascimento.');
            return;
        }

        let parsedWeight: number | undefined;

        if (weight.trim()) {
            parsedWeight = Number(weight.trim().replace(',', '.'));

            if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
                setErrorMessage('O peso deve ser positivo.');
                return;
            }
        }

        const request: RegisterTutorWithPetRequest = {
            tutor: {
                name: trimmedTutorName,
                cpf: trimmedCpf,
            },
            pet: {
                name: trimmedPetName,
                species,
            },
        };

        if (phone.trim()) {
            request.tutor.phone = phone.trim();
        }

        if (trimmedEmail) {
            request.tutor.email = trimmedEmail;
        }

        if (breed.trim()) {
            request.pet.breed = breed.trim();
        }

        if (sex !== null) {
            request.pet.sex = sex;
        }

        if (trimmedBirthDate) {
            request.pet.birthDate = trimmedBirthDate;
        }

        if (parsedWeight !== undefined) {
            request.pet.weight = parsedWeight;
        }

        setErrorMessage(null);

        try {
            await registerTutorWithPet.mutateAsync(request);
            Alert.alert(
                'Cadastro concluído',
                'Tutor e Pet cadastrados com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch {
            setErrorMessage(
                'Não foi possível cadastrar o Tutor e o Pet. Verifique os dados.',
            );
        }
    }

    const isPending = registerTutorWithPet.isPending;

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
                        <Text style={styles.eyebrow}>NOVO CADASTRO</Text>
                        <Text style={styles.title}>Cadastrar Tutor + Pet</Text>
                        <Text style={styles.description}>
                            Registre o responsável e o paciente em um único cadastro.
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.sectionEyebrow}>RESPONSÁVEL</Text>
                            <Text style={styles.sectionTitle}>Dados do Tutor</Text>
                            <Text style={styles.requiredHint}>Nome e CPF são obrigatórios.</Text>

                            <View style={styles.fields}>
                                <AppInput
                                    label="Nome *"
                                    value={tutorName}
                                    onChangeText={setTutorName}
                                    placeholder="Nome do Tutor"
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
                                    placeholder="Telefone (opcional)"
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
                                    onSubmitEditing={() => petNameInputRef.current?.focus()}
                                />
                            </View>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionEyebrow}>PACIENTE</Text>
                            <Text style={styles.sectionTitle}>Dados do Pet</Text>
                            <Text style={styles.requiredHint}>Nome e espécie são obrigatórios.</Text>

                            <View style={styles.fields}>
                                <AppInput
                                    ref={petNameInputRef}
                                    label="Nome *"
                                    value={petName}
                                    onChangeText={setPetName}
                                    placeholder="Nome do Pet"
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
                                    returnKeyType="done"
                                    onSubmitEditing={() => void handleSubmit()}
                                />
                            </View>
                        </View>

                        {errorMessage ? (
                            <View style={styles.errorContainer} accessibilityLiveRegion="polite">
                                <Text style={styles.error}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <AppButton
                            label="Cadastrar Tutor + Pet"
                            onPress={() => void handleSubmit()}
                            loading={isPending}
                        />
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
    sectionEyebrow: {
        marginBottom: spacing.xs,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1,
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
    fields: { gap: spacing.xl, marginTop: spacing.xl },
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
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
    optionPressed: { opacity: 0.75 },
    optionDisabled: { opacity: 0.6 },
    optionText: {
        color: colors.text,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    optionTextSelected: { color: colors.white },
    errorContainer: {
        marginVertical: spacing.lg,
        padding: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
        borderRadius: radii.sm,
        backgroundColor: '#FDF0F0',
    },
    error: { color: colors.danger, fontSize: typography.caption, lineHeight: 20 },
});
