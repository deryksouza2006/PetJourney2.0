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
import { useCreateClinic } from '../../hooks/clinics/useCreateClinic';
import { useUpdateClinic } from '../../hooks/clinics/useUpdateClinic';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { ClinicRequest } from '../../types/clinic';

type Props =
    | NativeStackScreenProps<SystemAdminStackParamList, 'CreateClinic'>
    | NativeStackScreenProps<SystemAdminStackParamList, 'EditClinic'>;

export function ClinicFormScreen(props: Props) {
    const { navigation, route } = props;
    const clinic = route.name === 'EditClinic' ? route.params.clinic : undefined;
    const isEditing = clinic !== undefined;
    const createClinic = useCreateClinic();
    const updateClinic = useUpdateClinic();
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

        if (!trimmedName || !trimmedCnpj) {
            setErrorMessage('Nome e CNPJ s\u00e3o obrigat\u00f3rios.');
            return;
        }

        const request: ClinicRequest = {
            name: trimmedName,
            cnpj: trimmedCnpj,
        };

        if (phone.trim()) {
            request.phone = phone.trim();
        }

        if (email.trim()) {
            request.email = email.trim();
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
                isEditing ? 'Altera\u00e7\u00f5es salvas' : 'Cadastro conclu\u00eddo',
                isEditing
                    ? 'Cl\u00ednica atualizada com sucesso.'
                    : 'Cl\u00ednica cadastrada com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch {
            setErrorMessage(
                isEditing
                    ? 'N\u00e3o foi poss\u00edvel atualizar a cl\u00ednica. Verifique os dados.'
                    : 'N\u00e3o foi poss\u00edvel cadastrar a cl\u00ednica. Verifique os dados.',
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
                {isEditing ? 'Editar Cl\u00ednica' : 'Cadastrar Cl\u00ednica'}
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
                value={cnpj}
                onChangeText={setCnpj}
                placeholder="CNPJ"
                keyboardType="numeric"
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
            />
            <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Endere\u00e7o"
                editable={!isPending}
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
