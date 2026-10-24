import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppHeader } from '../components/navigation/AppHeader';
import { AboutAppScreen } from '../screens/settings/AboutAppScreen';
import { ClinicAdminFormScreen } from '../screens/systemAdmin/ClinicAdminFormScreen';
import { ClinicFormScreen } from '../screens/systemAdmin/ClinicFormScreen';
import { ClinicListScreen } from '../screens/systemAdmin/ClinicListScreen';
import { SystemAdminHomeScreen } from '../screens/systemAdmin/SystemAdminHomeScreen';
import { SystemAdminPrivacyScreen } from '../screens/systemAdmin/SystemAdminPrivacyScreen';
import { Clinic } from '../types/clinic';

export type SystemAdminStackParamList = {
    SystemAdminHome: undefined;
    Clinics: undefined;
    CreateClinic: undefined;
    EditClinic: { clinic: Clinic };
    CreateClinicAdmin: { clinicId: number; clinicName: string };
    SystemAdminPrivacy: undefined;
    AboutApp: undefined;
};

const Stack = createNativeStackNavigator<SystemAdminStackParamList>();

export function SystemAdminNavigator() {
    return (
        <Stack.Navigator initialRouteName="SystemAdminHome">
            <Stack.Screen
                name="SystemAdminHome"
                component={SystemAdminHomeScreen}
                options={{
                    header: () => (
                        <AppHeader contextLabel="Administração" includeSystemTheme />
                    ),
                }}
            />
            <Stack.Screen
                name="Clinics"
                component={ClinicListScreen}
                options={{ title: 'Clínicas' }}
            />
            <Stack.Screen
                name="CreateClinic"
                component={ClinicFormScreen}
                options={{ title: 'Cadastrar Clínica' }}
            />
            <Stack.Screen
                name="EditClinic"
                component={ClinicFormScreen}
                options={{ title: 'Editar Clínica' }}
            />
            <Stack.Screen
                name="CreateClinicAdmin"
                component={ClinicAdminFormScreen}
                options={{ title: 'Criar administrador' }}
            />
            <Stack.Screen
                name="SystemAdminPrivacy"
                component={SystemAdminPrivacyScreen}
                options={{ title: 'Privacidade e Dados' }}
            />
            <Stack.Screen
                name="AboutApp"
                component={AboutAppScreen}
                options={{ title: 'Sobre o App' }}
            />
        </Stack.Navigator>
    );
}
