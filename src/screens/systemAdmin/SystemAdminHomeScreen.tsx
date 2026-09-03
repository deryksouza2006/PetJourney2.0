import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';

type Props = NativeStackScreenProps<
    SystemAdminStackParamList,
    'SystemAdminHome'
>;

export function SystemAdminHomeScreen({ navigation }: Props) {
    const { signOut } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Administrador do Sistema</Text>
            <Text style={styles.description}>Perfil autenticado: ADMIN_SISTEMA</Text>
            <View style={styles.actions}>
                <Button
                    title="Ver cl\u00ednicas"
                    onPress={() => navigation.navigate('Clinics')}
                    color="#2f7d6d"
                />
                <Button title="Sair" onPress={() => void signOut()} color="#2f7d6d" />
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
