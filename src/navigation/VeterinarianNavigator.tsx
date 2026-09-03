import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VeterinarianHomeScreen } from '../screens/veterinarian/VeterinarianHomeScreen';

type VeterinarianStackParamList = {
    VeterinarianHome: undefined;
};

const Stack = createNativeStackNavigator<VeterinarianStackParamList>();

export function VeterinarianNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="VeterinarianHome"
                component={VeterinarianHomeScreen}
                options={{ title: 'PetJourney' }}
            />
        </Stack.Navigator>
    );
}
