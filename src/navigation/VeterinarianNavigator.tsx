import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RegisterTutorWithPetScreen } from '../screens/veterinarian/RegisterTutorWithPetScreen';
import { VeterinarianAvailabilityScreen } from '../screens/veterinarian/VeterinarianAvailabilityScreen';
import { VeterinarianHomeScreen } from '../screens/veterinarian/VeterinarianHomeScreen';
import { VeterinarianPetDetailsScreen } from '../screens/veterinarian/VeterinarianPetDetailsScreen';
import { VeterinarianPetListScreen } from '../screens/veterinarian/VeterinarianPetListScreen';

export type VeterinarianStackParamList = {
    VeterinarianHome: undefined;
    RegisterTutorWithPet: undefined;
    VeterinarianAvailability: undefined;
    Patients: undefined;
    PetDetails: { petId: number };
};

const Stack = createNativeStackNavigator<VeterinarianStackParamList>();

export function VeterinarianNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="VeterinarianHome"
                component={VeterinarianHomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RegisterTutorWithPet"
                component={RegisterTutorWithPetScreen}
                options={{ title: 'Cadastrar Paciente' }}
            />
            <Stack.Screen
                name="VeterinarianAvailability"
                component={VeterinarianAvailabilityScreen}
                options={{ title: 'Minha disponibilidade' }}
            />
            <Stack.Screen
                name="Patients"
                component={VeterinarianPetListScreen}
                options={{ title: 'Pacientes' }}
            />
            <Stack.Screen
                name="PetDetails"
                component={VeterinarianPetDetailsScreen}
                options={{ title: 'Detalhes do Pet' }}
            />
        </Stack.Navigator>
    );
}
