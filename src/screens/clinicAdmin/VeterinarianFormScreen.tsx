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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateVeterinarian } from '../../hooks/veterinarians/useCreateVeterinarian';
import { useUpdateVeterinarian } from '../../hooks/veterinarians/useUpdateVeterinarian';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { VeterinarianRequest } from '../../types/veterinarian';

type Props =
    | NativeStackScreenProps<ClinicAdminStackParamList, 'CreateVeterinarian'>
    | NativeStackScreenProps<ClinicAdminStackParamList, 'EditVeterinarian'>;

export function VeterinarianFormScreen(props: Props) {
    const { navigation, route } = props;
    const veterinarian =
        route.name === 'EditVeterinarian'
            ? route.params.veterinarian
            : undefined;
    const isEditing = veterinarian !== undefined;
    const { user } = useAuth();
    const createVeterinarian = useCreateVeterinarian();
    const updateVeterinarian = useUpdateVeterinarian();
    const [name, setName] = useState(veterinarian?.name ?? '');
    const [crmv, setCrmv] = useState(veterinarian?.crmv ?? '');
    const [phone, setPhone] = useState(veterinarian?.phone ?? '');
    const [email, setEmail] = useState(veterinarian?.email ?? '');
    const [specialty, setSpecialty] = useState(
        veterinarian?.specialty ?? '',
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isPending =
        createVeterinarian.isPending || updateVeterinarian.isPending;

    async function handleSubmit(): Promise<void> {
        const trimmedName = name.trim();
        const trimmedCrmv = crmv.trim();

        if (!trimmedName || !trimmedCrmv) {
            setErrorMessage('Nome e CRMV s\u00e3o obrigat\u00f3rios.');
            return;
        }

        if (user?.clinicId == null) {
            setErrorMessage('N\u00e3o foi poss\u00edvel identificar a cl\u00ednica da sess\u00e3o.');
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
        } else if (!isEditing && email.trim()) {
            request.email = email.trim();
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
                isEditing ? 'Altera\u00e7\u00f5es salvas' : 'Cadastro conclu\u00eddo',
                isEditing
                    ? 'Veterin\u00e1rio atualizado com sucesso.'
                    : 'Veterin\u00e1rio cadastrado com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch {
            setErrorMessage(
                isEditing
                    ? 'N\u00e3o foi poss\u00edvel atualizar o veterin\u00e1rio. Verifique os dados.'
                    : 'N\u00e3o foi poss\u00edvel cadastrar o veterin\u00e1rio. Verifique os dados.',
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
                {isEditing ? 'Editar Veterin\u00e1rio' : 'Cadastrar Veterin\u00e1rio'}
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
                value={crmv}
                onChangeText={setCrmv}
                placeholder="CRMV"
                autoCapitalize="characters"
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
                editable={!isEditing && !isPending}
            />
            <TextInput
                style={styles.input}
                value={specialty}
                onChangeText={setSpecialty}
                placeholder="Especialidade"
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
