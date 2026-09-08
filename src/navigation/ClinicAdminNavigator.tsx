import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, View } from 'react-native';
import { ClinicAdminHomeScreen } from '../screens/clinicAdmin/ClinicAdminHomeScreen';
import { PetFormScreen } from '../screens/clinicAdmin/PetFormScreen';
import { PetListScreen } from '../screens/clinicAdmin/PetListScreen';
import { TutorFormScreen } from '../screens/clinicAdmin/TutorFormScreen';
import { TutorListScreen } from '../screens/clinicAdmin/TutorListScreen';
import { VeterinarianFormScreen } from '../screens/clinicAdmin/VeterinarianFormScreen';
import { VeterinarianListScreen } from '../screens/clinicAdmin/VeterinarianListScreen';
import { Tutor } from '../types/tutor';
import { Pet } from '../types/pet';
import { Veterinarian } from '../types/veterinarian';

export type ClinicAdminStackParamList = {
    ClinicAdminHome: undefined;
    Veterinarians: undefined;
    CreateVeterinarian: undefined;
    EditVeterinarian: { veterinarian: Veterinarian };
    Pets: undefined;
    CreatePet: undefined;
    EditPet: { pet: Pet };
    Tutors: undefined;
    CreateTutor: undefined;
    EditTutor: { tutor: Tutor };
};

const Stack = createNativeStackNavigator<ClinicAdminStackParamList>();

export function ClinicAdminNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ClinicAdminHome"
                component={ClinicAdminHomeScreen}
                options={({ navigation }) => ({
                    title: 'PetJourney',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row' }}>
                            <Button
                                title="Veterin\u00e1rios"
                                onPress={() =>
                                    navigation.navigate('Veterinarians')
                                }
                                color="#2f7d6d"
                            />
                            <Button
                                title="Tutores"
                                onPress={() => navigation.navigate('Tutors')}
                                color="#2f7d6d"
                            />
                            <Button
                                title="Pets"
                                onPress={() => navigation.navigate('Pets')}
                                color="#2f7d6d"
                            />
                        </View>
                    ),
                })}
            />
            <Stack.Screen
                name="Veterinarians"
                component={VeterinarianListScreen}
                options={{ title: 'Veterin\u00e1rios' }}
            />
            <Stack.Screen
                name="CreateVeterinarian"
                component={VeterinarianFormScreen}
                options={{ title: 'Cadastrar Veterin\u00e1rio' }}
            />
            <Stack.Screen
                name="EditVeterinarian"
                component={VeterinarianFormScreen}
                options={{ title: 'Editar Veterin\u00e1rio' }}
            />
            <Stack.Screen
                name="Pets"
                component={PetListScreen}
                options={{ title: 'Pets' }}
            />
            <Stack.Screen
                name="CreatePet"
                component={PetFormScreen}
                options={{ title: 'Cadastrar Pet' }}
            />
            <Stack.Screen
                name="EditPet"
                component={PetFormScreen}
                options={{ title: 'Editar Pet' }}
            />
            <Stack.Screen
                name="Tutors"
                component={TutorListScreen}
                options={{ title: 'Tutores' }}
            />
            <Stack.Screen
                name="CreateTutor"
                component={TutorFormScreen}
                options={{ title: 'Cadastrar Tutor' }}
            />
            <Stack.Screen
                name="EditTutor"
                component={TutorFormScreen}
                options={{ title: 'Editar Tutor' }}
            />
        </Stack.Navigator>
    );
}
