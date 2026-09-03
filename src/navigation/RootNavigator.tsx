import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { ClinicAdminNavigator } from './ClinicAdminNavigator';
import { SystemAdminNavigator } from './SystemAdminNavigator';
import { VeterinarianNavigator } from './VeterinarianNavigator';

export function RootNavigator() {
    const { user, isLoading, signOut } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2f7d6d" />
            </View>
        );
    }

    function renderNavigator() {
        if (!user) {
            return <AuthNavigator />;
        }

        switch (user.role) {
            case 'ADMIN_SISTEMA':
                return <SystemAdminNavigator />;
            case 'ADMIN_CLINICA':
                return <ClinicAdminNavigator />;
            case 'VETERINARIO':
                return <VeterinarianNavigator />;
            case 'TUTOR':
                return (
                    <View style={styles.centered}>
                        <Text style={styles.title}>Perfil ainda indispon�vel</Text>
                        <Text style={styles.message}>
                            As funcionalidades de Tutor ser�o adicionadas em uma pr�xima Sprint.
                        </Text>
                        <Button title="Sair" onPress={() => void signOut()} color="#2f7d6d" />
                    </View>
                );
        }
    }

    return (
        <NavigationContainer>
            {renderNavigator()}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f4f8f7',
    },
    title: {
        marginBottom: 8,
        color: '#173f37',
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    message: {
        marginBottom: 24,
        color: '#4b625d',
        fontSize: 16,
        textAlign: 'center',
    },
});
