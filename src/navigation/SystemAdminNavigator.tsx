import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClinicFormScreen } from '../screens/systemAdmin/ClinicFormScreen';
import { ClinicListScreen } from '../screens/systemAdmin/ClinicListScreen';
import { SystemAdminHomeScreen } from '../screens/systemAdmin/SystemAdminHomeScreen';

export type SystemAdminStackParamList = {
    SystemAdminHome: undefined;
    Clinics: undefined;
    CreateClinic: undefined;
};

const Stack = createNativeStackNavigator<SystemAdminStackParamList>();

export function SystemAdminNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SystemAdminHome"
                component={SystemAdminHomeScreen}
                options={{ title: 'PetJourney' }}
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
        </Stack.Navigator>
    );
}
