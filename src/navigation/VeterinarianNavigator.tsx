import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/navigation/AppHeader';
import { useTheme } from '../contexts/ThemeContext';
import { AboutAppScreen } from '../screens/settings/AboutAppScreen';
import { RegisterTutorWithPetScreen } from '../screens/veterinarian/RegisterTutorWithPetScreen';
import { VeterinarianAvailabilityScreen } from '../screens/veterinarian/VeterinarianAvailabilityScreen';
import { VeterinarianConsultationFormScreen } from '../screens/veterinarian/VeterinarianConsultationFormScreen';
import { VeterinarianHomeScreen } from '../screens/veterinarian/VeterinarianHomeScreen';
import { VeterinarianPetDetailsScreen } from '../screens/veterinarian/VeterinarianPetDetailsScreen';
import { VeterinarianPetListScreen } from '../screens/veterinarian/VeterinarianPetListScreen';
import { VeterinarianPrivacyScreen } from '../screens/veterinarian/VeterinarianPrivacyScreen';
import { VeterinarianProfileDetailsScreen } from '../screens/veterinarian/VeterinarianProfileDetailsScreen';
import { VeterinarianProfileScreen } from '../screens/veterinarian/VeterinarianProfileScreen';
import { VeterinarianSmartCareScreen } from '../screens/veterinarian/VeterinarianSmartCareScreen';
import { spacing, typography } from '../theme/tokens';
import { AppointmentResponse } from '../types/workflow';

export type VeterinarianTabParamList = {
    VeterinarianHome: undefined;
    Patients: undefined;
    VeterinarianAvailability: undefined;
    SmartCare: undefined;
    VeterinarianProfile: undefined;
};

export type VeterinarianStackParamList = {
    VeterinarianTabs: NavigatorScreenParams<VeterinarianTabParamList> | undefined;
    RegisterTutorWithPet: undefined;
    PetDetails: { petId: number };
    RegisterConsultation: { petId: number; appointment: AppointmentResponse };
    VeterinarianProfileDetails: undefined;
    VeterinarianPrivacy: undefined;
    AboutApp: undefined;
};

const Stack = createNativeStackNavigator<VeterinarianStackParamList>();
const Tab = createBottomTabNavigator<VeterinarianTabParamList>();

function VeterinarianTabs() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                header: () => (
                    <AppHeader contextLabel="Área Veterinária" />
                ),
                sceneStyle: { backgroundColor: colors.background },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarHideOnKeyboard: true,
                tabBarLabelStyle: {
                    fontSize: typography.small,
                    fontWeight: '700',
                },
                tabBarStyle: {
                    height: 60 + insets.bottom,
                    paddingTop: spacing.xs,
                    paddingBottom: Math.max(insets.bottom, spacing.xs),
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: colors.border,
                    backgroundColor: colors.surface,
                },
            }}
        >
            <Tab.Screen
                name="VeterinarianHome"
                component={VeterinarianHomeScreen}
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Patients"
                component={VeterinarianPetListScreen}
                options={{
                    title: 'Pacientes',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'paw' : 'paw-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="VeterinarianAvailability"
                component={VeterinarianAvailabilityScreen}
                options={{
                    title: 'Agenda',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'calendar' : 'calendar-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="SmartCare"
                component={VeterinarianSmartCareScreen}
                options={{
                    title: 'SmartCare',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'pulse' : 'pulse-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="VeterinarianProfile"
                component={VeterinarianProfileScreen}
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export function VeterinarianNavigator() {
    return (
        <Stack.Navigator initialRouteName="VeterinarianTabs">
            <Stack.Screen
                name="VeterinarianTabs"
                component={VeterinarianTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RegisterTutorWithPet"
                component={RegisterTutorWithPetScreen}
                options={{ title: 'Cadastrar Paciente' }}
            />
            <Stack.Screen
                name="PetDetails"
                component={VeterinarianPetDetailsScreen}
                options={{ title: 'Detalhes do Pet' }}
            />
            <Stack.Screen
                name="RegisterConsultation"
                component={VeterinarianConsultationFormScreen}
                options={{ title: 'Registrar atendimento' }}
            />
            <Stack.Screen
                name="VeterinarianProfileDetails"
                component={VeterinarianProfileDetailsScreen}
                options={{ title: 'Dados profissionais' }}
            />
            <Stack.Screen
                name="VeterinarianPrivacy"
                component={VeterinarianPrivacyScreen}
                options={{ title: 'Privacidade e dados' }}
            />
            <Stack.Screen
                name="AboutApp"
                component={AboutAppScreen}
                options={{ title: 'Sobre o App' }}
            />
        </Stack.Navigator>
    );
}
