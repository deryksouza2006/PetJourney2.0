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
import { useRegisterTutorWithPet } from '../../hooks/workflows/useRegisterTutorWithPet';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';
import { PetSex, PetSpecies } from '../../types/pet';
import { RegisterTutorWithPetRequest } from '../../types/workflow';

type Props = NativeStackScreenProps<
    VeterinarianStackParamList,
    'RegisterTutorWithPet'
>;

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

        if (
            trimmedBirthDate &&
            !/^\d{4}-\d{2}-\d{2}$/.test(trimmedBirthDate)
        ) {
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

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Cadastrar Tutor + Pet</Text>

            <Text style={styles.sectionTitle}>Tutor</Text>
            <TextInput
                style={styles.input}
                value={tutorName}
                onChangeText={setTutorName}
                placeholder="Nome"
                editable={!registerTutorWithPet.isPending}
            />
            <TextInput
                style={styles.input}
                value={cpf}
                onChangeText={setCpf}
                placeholder="CPF (11 dígitos)"
                keyboardType="number-pad"
                maxLength={11}
                editable={!registerTutorWithPet.isPending}
            />
            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefone (opcional)"
                keyboardType="phone-pad"
                editable={!registerTutorWithPet.isPending}
            />
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail (opcional)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!registerTutorWithPet.isPending}
            />

            <Text style={styles.sectionTitle}>Pet</Text>
            <TextInput
                style={styles.input}
                value={petName}
                onChangeText={setPetName}
                placeholder="Nome"
                editable={!registerTutorWithPet.isPending}
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
                        disabled={registerTutorWithPet.isPending}
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
                editable={!registerTutorWithPet.isPending}
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
                        disabled={registerTutorWithPet.isPending}
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
                    disabled={registerTutorWithPet.isPending}
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
                editable={!registerTutorWithPet.isPending}
            />
            <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Peso (opcional)"
                keyboardType="decimal-pad"
                editable={!registerTutorWithPet.isPending}
            />

            {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    registerTutorWithPet.isPending && styles.buttonDisabled,
                ]}
                onPress={() => void handleSubmit()}
                disabled={registerTutorWithPet.isPending}
            >
                {registerTutorWithPet.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Cadastrar</Text>
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
    sectionTitle: {
        marginBottom: 12,
        color: '#173f37',
        fontSize: 20,
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
