import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClinicAdminHomeScreen } from '../screens/clinicAdmin/ClinicAdminHomeScreen';

type ClinicAdminStackParamList = {
    ClinicAdminHome: undefined;
};

const Stack = createNativeStackNavigator<ClinicAdminStackParamList>();

export function ClinicAdminNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ClinicAdminHome"
                component={ClinicAdminHomeScreen}
                options={{ title: 'PetJourney' }}
            />
        </Stack.Navigator>
    );
}
