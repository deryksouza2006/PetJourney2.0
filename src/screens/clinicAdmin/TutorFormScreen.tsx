import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from 'react-native';
import { useCreateTutor } from '../../hooks/tutors/useCreateTutor';
import { useUpdateTutor } from '../../hooks/tutors/useUpdateTutor';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { TutorRequest } from '../../types/tutor';

type Props =
    | NativeStackScreenProps<ClinicAdminStackParamList, 'CreateTutor'>
    | NativeStackScreenProps<ClinicAdminStackParamList, 'EditTutor'>;

interface BackendErrorResponse {
    message?: string;
}

export function TutorFormScreen(props: Props) {
    const { navigation, route } = props;
    const tutor = route.name === 'EditTutor' ? route.params.tutor : undefined;
    const isEditing = tutor !== undefined;
    const createTutor = useCreateTutor();
    const updateTutor = useUpdateTutor();
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
            setErrorMessage('Nome e CPF s\u00e3o obrigat\u00f3rios.');
            return;
        }

        if (!/^\d{11}$/.test(trimmedCpf)) {
            setErrorMessage('O CPF deve conter 11 d\u00edgitos.');
            return;
        }

        if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            setErrorMessage('Informe um e-mail v\u00e1lido.');
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
                isEditing ? 'Altera\u00e7\u00f5es salvas' : 'Cadastro conclu\u00eddo',
                isEditing
                    ? 'Tutor atualizado com sucesso.'
                    : 'Tutor cadastrado com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch (error: unknown) {
            if (
                isEditing &&
                axios.isAxiosError<BackendErrorResponse>(error) &&
                error.response?.status === 403 &&
                error.response.data?.message
            ) {
                setErrorMessage(error.response.data.message);
                return;
            }

            setErrorMessage(
                isEditing
                    ? 'N\u00e3o foi poss\u00edvel atualizar o tutor. Verifique os dados.'
                    : 'N\u00e3o foi poss\u00edvel cadastrar o tutor. Verifique os dados.',
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
                {isEditing ? 'Editar Tutor' : 'Cadastrar Tutor'}
            </Text>

            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nome"
                editable={!isPending}
            />
            <TextInput
                style={styles.input}
                value={cpf}
                onChangeText={setCpf}
                placeholder="CPF (11 d\u00edgitos)"
                keyboardType="number-pad"
                maxLength={11}
                editable={!isPending}
            />
            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefone"
                keyboardType="phone-pad"
                editable={!isPending}
            />
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isPending}
                onSubmitEditing={() => void handleSubmit()}
            />

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
                        {isEditing ? 'Salvar altera\u00e7\u00f5es' : 'Cadastrar'}
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
