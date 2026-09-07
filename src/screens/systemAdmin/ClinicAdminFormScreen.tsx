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
import { useCreateClinicAdmin } from '../../hooks/clinicAdmins/useCreateClinicAdmin';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { ClinicAdminRequest } from '../../types/clinicAdmin';

type Props = NativeStackScreenProps<
    SystemAdminStackParamList,
    'CreateClinicAdmin'
>;

export function ClinicAdminFormScreen({ navigation, route }: Props) {
    const createClinicAdmin = useCreateClinicAdmin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleSubmit(): Promise<void> {
        const username = email.trim();

        if (!username || !password.trim()) {
            setErrorMessage('E-mail e senha s\u00e3o obrigat\u00f3rios.');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        const request: ClinicAdminRequest = {
            username,
            password,
        };

        setErrorMessage(null);

        try {
            await createClinicAdmin.mutateAsync({
                clinicId: route.params.clinicId,
                request,
            });
            Alert.alert(
                'Administrador criado',
                'Administrador da cl\u00ednica criado com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch {
            setErrorMessage(
                'N\u00e3o foi poss\u00edvel criar o administrador. Verifique os dados e se o e-mail j\u00e1 est\u00e1 cadastrado.',
            );
        }
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Criar administrador</Text>
            <Text style={styles.clinicName}>{route.params.clinicName}</Text>

            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!createClinicAdmin.isPending}
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                secureTextEntry
                editable={!createClinicAdmin.isPending}
                onSubmitEditing={() => void handleSubmit()}
            />

            {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
            ) : null}

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    createClinicAdmin.isPending && styles.buttonDisabled,
                ]}
                onPress={() => void handleSubmit()}
                disabled={createClinicAdmin.isPending}
            >
                {createClinicAdmin.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Criar administrador</Text>
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
        color: '#173f37',
        fontSize: 28,
        fontWeight: '700',
    },
    clinicName: {
        marginTop: 6,
        marginBottom: 20,
        color: '#4b625d',
        fontSize: 16,
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
