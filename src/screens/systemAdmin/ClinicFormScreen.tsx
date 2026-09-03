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
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { ClinicRequest } from '../../types/clinic';

type Props = NativeStackScreenProps<
    SystemAdminStackParamList,
    'CreateClinic'
>;

export function ClinicFormScreen({ navigation }: Props) {
    const createClinic = useCreateClinic();
    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            await createClinic.mutateAsync(request);
            Alert.alert(
                'Cadastro conclu\u00eddo',
                'Cl\u00ednica cadastrada com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch {
            setErrorMessage(
                'N\u00e3o foi poss\u00edvel cadastrar a cl\u00ednica. Verifique os dados.',
            );
        }
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Cadastrar Cl\u00ednica</Text>

            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nome"
                editable={!createClinic.isPending}
            />
            <TextInput
                style={styles.input}
                value={cnpj}
                onChangeText={setCnpj}
                placeholder="CNPJ"
                keyboardType="numeric"
                editable={!createClinic.isPending}
            />
            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefone"
                keyboardType="phone-pad"
                editable={!createClinic.isPending}
            />
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!createClinic.isPending}
            />
            <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Endere\u00e7o"
                editable={!createClinic.isPending}
            />

            {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    createClinic.isPending && styles.buttonDisabled,
                ]}
                onPress={() => void handleSubmit()}
                disabled={createClinic.isPending}
            >
                {createClinic.isPending ? (
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
