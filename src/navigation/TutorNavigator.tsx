import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TutorAgendaScreen } from '../screens/tutor/TutorAgendaScreen';
import { TutorAppointmentScreen } from '../screens/tutor/TutorAppointmentScreen';
import { TutorHomeScreen } from '../screens/tutor/TutorHomeScreen';
import { TutorPetDetailsScreen } from '../screens/tutor/TutorPetDetailsScreen';
import { TutorPetListScreen } from '../screens/tutor/TutorPetListScreen';

export type TutorStackParamList = {
    TutorHome: undefined;
    TutorAgenda: undefined;
    TutorAppointment: undefined;
    TutorPets: undefined;
    TutorPetDetails: { petId: number };
};

const Stack = createNativeStackNavigator<TutorStackParamList>();

export function TutorNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="TutorHome"
                component={TutorHomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TutorAgenda"
                component={TutorAgendaScreen}
                options={{ title: 'Agenda' }}
            />
            <Stack.Screen
                name="TutorAppointment"
                component={TutorAppointmentScreen}
                options={{ title: 'Agendar consulta' }}
            />
            <Stack.Screen
                name="TutorPets"
                component={TutorPetListScreen}
                options={{ title: 'Meus Pets' }}
            />
            <Stack.Screen
                name="TutorPetDetails"
                component={TutorPetDetailsScreen}
                options={{ title: 'Detalhes do Pet' }}
            />
        </Stack.Navigator>
    );
}
