import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';

type Props = NativeStackScreenProps<
    VeterinarianStackParamList,
    'VeterinarianHome'
>;

export function VeterinarianHomeScreen({ navigation }: Props) {
    const { signOut } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Veterin�rio</Text>
            <Text style={styles.description}>Perfil autenticado: VETERINARIO</Text>
            <View style={styles.actions}>
                <Button
                    title="Pacientes"
                    onPress={() => navigation.navigate('Patients')}
                    color="#2f7d6d"
                />
                <Button
                    title="Cadastrar Tutor + Pet"
                    onPress={() => navigation.navigate('RegisterTutorWithPet')}
                    color="#2f7d6d"
                />
                <Button
                    title="Sair"
                    onPress={() => void signOut()}
                    color="#2f7d6d"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f4f8f7',
    },
    title: {
        marginBottom: 8,
        color: '#173f37',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    description: {
        marginBottom: 24,
        color: '#4b625d',
        fontSize: 16,
        textAlign: 'center',
    },
    actions: {
        gap: 12,
    },
});
