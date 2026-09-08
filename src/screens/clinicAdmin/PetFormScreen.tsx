import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useCreatePet } from '../../hooks/pets/useCreatePet';
import { useUpdatePet } from '../../hooks/pets/useUpdatePet';
import { useTutors } from '../../hooks/tutors/useTutors';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { PetRequest, PetSex, PetSpecies } from '../../types/pet';

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
    const tutors = useTutors();
    const [name, setName] = useState(pet?.name ?? '');
    const [species, setSpecies] = useState<PetSpecies | null>(
        pet?.species ?? null,
    );
    const [breed, setBreed] = useState(pet?.breed ?? '');
    const [sex, setSex] = useState<PetSex | null>(pet?.sex ?? null);
    const [birthDate, setBirthDate] = useState(pet?.birthDate ?? '');
    const [weight, setWeight] = useState(
        pet?.weight !== null && pet?.weight !== undefined
            ? pet.weight.toString()
            : '',
    );
    const [tutorId, setTutorId] = useState<number | null>(
        pet?.tutorId ?? null,
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isPending = createPet.isPending || updatePet.isPending;

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
            if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedBirthDate)) {
                setErrorMessage('Use o formato AAAA-MM-DD para o nascimento.');
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
        } catch {
            setErrorMessage(
                isEditing
                    ? 'Não foi possível atualizar o Pet. Verifique os dados.'
                    : 'Não foi possível cadastrar o Pet. Verifique os dados.',
            );
        }
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>
                {isEditing ? 'Editar Pet' : 'Cadastrar Pet'}
            </Text>

            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nome"
                editable={!isPending}
            />

            <Text style={styles.label}>Espécie</Text>
            <View style={styles.options}>
                {SPECIES_OPTIONS.map((option) => (
                    <Pressable
                        key={option}
                        style={[
                            styles.option,
                            species === option && styles.optionSelected,
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

            <TextInput
                style={styles.input}
                value={breed}
                onChangeText={setBreed}
                placeholder="Raça (opcional)"
                editable={!isPending}
            />

            <Text style={styles.label}>Sexo (opcional)</Text>
            <View style={styles.options}>
                {SEX_OPTIONS.map((option) => (
                    <Pressable
                        key={option}
                        style={[
                            styles.option,
                            sex === option && styles.optionSelected,
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
                    style={[
                        styles.option,
                        sex === null && styles.optionSelected,
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

            <TextInput
                style={styles.input}
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="Nascimento (AAAA-MM-DD, opcional)"
                editable={!isPending}
            />
            <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Peso (opcional)"
                keyboardType="decimal-pad"
                editable={!isPending}
            />

            <Text style={styles.label}>Tutor</Text>
            {tutors.isPending ? (
                <ActivityIndicator color="#2f7d6d" />
            ) : tutors.isError ? (
                <Text style={styles.error}>
                    Não foi possível carregar os Tutores.
                </Text>
            ) : tutors.data.content.length === 0 ? (
                <Text style={styles.message}>Nenhum Tutor disponível.</Text>
            ) : (
                <View style={styles.tutors}>
                    {tutors.data.content.map((tutor) => (
                        <Pressable
                            key={tutor.id}
                            style={[
                                styles.tutorOption,
                                tutorId === tutor.id && styles.optionSelected,
                            ]}
                            onPress={() => setTutorId(tutor.id)}
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

            {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    isPending && styles.buttonDisabled,
                ]}
                onPress={() => void handleSubmit()}
                disabled={isPending}
            >
                {isPending ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>
                        {isEditing ? 'Salvar alterações' : 'Cadastrar'}
                    </Text>
                )}
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f8f7',
    },
    content: {
        padding: 20,
    },
    title: {
        marginBottom: 20,
        color: '#173f37',
        fontSize: 28,
        fontWeight: '700',
    },
    input: {
        height: 48,
        marginBottom: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#b8c9c5',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        fontSize: 16,
    },
    label: {
        marginBottom: 8,
        color: '#173f37',
        fontSize: 16,
        fontWeight: '700',
    },
    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },
    option: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#b8c9c5',
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },
    tutorOption: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#b8c9c5',
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },
    optionSelected: {
        borderColor: '#2f7d6d',
        backgroundColor: '#2f7d6d',
    },
    optionText: {
        color: '#173f37',
        fontSize: 15,
    },
    optionTextSelected: {
        color: '#ffffff',
    },
    tutors: {
        gap: 8,
        marginBottom: 14,
    },
    message: {
        marginBottom: 14,
        color: '#4b625d',
        textAlign: 'center',
    },
    error: {
        marginBottom: 14,
        color: '#b42318',
        textAlign: 'center',
    },
    button: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#2f7d6d',
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});
