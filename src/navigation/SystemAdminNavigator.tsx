import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClinicAdminFormScreen } from '../screens/systemAdmin/ClinicAdminFormScreen';
import { ClinicFormScreen } from '../screens/systemAdmin/ClinicFormScreen';
import { ClinicListScreen } from '../screens/systemAdmin/ClinicListScreen';
import { SystemAdminHomeScreen } from '../screens/systemAdmin/SystemAdminHomeScreen';
import { Clinic } from '../types/clinic';

export type SystemAdminStackParamList = {
    SystemAdminHome: undefined;
    Clinics: undefined;
    CreateClinic: undefined;
    EditClinic: { clinic: Clinic };
    CreateClinicAdmin: { clinicId: number; clinicName: string };
};

const Stack = createNativeStackNavigator<SystemAdminStackParamList>();

export function SystemAdminNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SystemAdminHome"
                component={SystemAdminHomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Clinics"
                component={ClinicListScreen}
                options={{ title: 'Cl\u00ednicas' }}
            />
            <Stack.Screen
                name="CreateClinic"
                component={ClinicFormScreen}
                options={{ title: 'Cadastrar Cl\u00ednica' }}
            />
            <Stack.Screen
                name="EditClinic"
                component={ClinicFormScreen}
                options={{ title: 'Editar Cl\u00ednica' }}
            />
            <Stack.Screen
                name="CreateClinicAdmin"
                component={ClinicAdminFormScreen}
                options={{ title: 'Criar administrador' }}
            />
        </Stack.Navigator>
    );
}
