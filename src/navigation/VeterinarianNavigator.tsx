import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RegisterTutorWithPetScreen } from '../screens/veterinarian/RegisterTutorWithPetScreen';
import { VeterinarianHomeScreen } from '../screens/veterinarian/VeterinarianHomeScreen';

export type VeterinarianStackParamList = {
    VeterinarianHome: undefined;
    RegisterTutorWithPet: undefined;
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
            <Stack.Screen
                name="RegisterTutorWithPet"
                component={RegisterTutorWithPetScreen}
                options={{ title: 'Cadastrar Tutor + Pet' }}
            />
        </Stack.Navigator>
    );
}
