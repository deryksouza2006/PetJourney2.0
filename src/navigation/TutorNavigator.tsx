import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabScreenProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    createNativeStackNavigator,
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/navigation/AppHeader';
import { NavigationHubScreen } from '../components/navigation/NavigationHubScreen';
import { useTheme } from '../contexts/ThemeContext';
import { AboutAppScreen } from '../screens/settings/AboutAppScreen';
import { TutorAgendaScreen } from '../screens/tutor/TutorAgendaScreen';
import { TutorAppointmentScreen } from '../screens/tutor/TutorAppointmentScreen';
import { TutorHomeScreen } from '../screens/tutor/TutorHomeScreen';
import { TutorMedicalRecordsScreen } from '../screens/tutor/TutorMedicalRecordsScreen';
import { TutorMedicationsScreen } from '../screens/tutor/TutorMedicationsScreen';
import { TutorPetDetailsScreen } from '../screens/tutor/TutorPetDetailsScreen';
import { TutorPetListScreen } from '../screens/tutor/TutorPetListScreen';
import { TutorPrivacyScreen } from '../screens/tutor/TutorPrivacyScreen';
import { TutorProfileDetailsScreen } from '../screens/tutor/TutorProfileDetailsScreen';
import { TutorProfileScreen } from '../screens/tutor/TutorProfileScreen';
import { spacing, typography } from '../theme/tokens';

export type TutorTabParamList = {
    TutorHome: undefined;
    TutorPets: undefined;
    TutorAgenda: undefined;
    TutorHealth: undefined;
    TutorProfile: undefined;
};

export type TutorStackParamList = {
    TutorTabs: NavigatorScreenParams<TutorTabParamList> | undefined;
    TutorAppointment: undefined;
    TutorMedicalRecords: undefined;
    TutorMedications: undefined;
    TutorPetDetails: { petId: number };
    TutorProfileDetails: undefined;
    TutorPrivacy: undefined;
    AboutApp: undefined;
};

const Stack = createNativeStackNavigator<TutorStackParamList>();
const Tab = createBottomTabNavigator<TutorTabParamList>();

type HealthProps = BottomTabScreenProps<TutorTabParamList, 'TutorHealth'>;

function TutorHealthScreen({ navigation }: HealthProps) {
    const parentNavigation = navigation.getParent<NativeStackNavigationProp<TutorStackParamList>>();

    return (
        <NavigationHubScreen
            eyebrow="SAÚDE"
            title="Saúde do pet"
            description="Consulte os registros de saúde dos seus pets."
            actions={[
                {
                    icon: 'document-text-outline',
                    title: 'Prontuário',
                    description: 'Consulte registros e informações clínicas.',
                    onPress: () => parentNavigation?.navigate('TutorMedicalRecords'),
                },
                {
                    icon: 'medical-outline',
                    title: 'Medicamentos',
                    description: 'Acompanhe os medicamentos registrados.',
                    onPress: () => parentNavigation?.navigate('TutorMedications'),
                },
            ]}
        />
    );
}

function TutorTabs() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                header: () => (
                    <AppHeader contextLabel="Área do Tutor" />
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
                name="TutorHome"
                component={TutorHomeScreen}
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="TutorPets"
                component={TutorPetListScreen}
                options={{
                    title: 'Pets',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'paw' : 'paw-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="TutorAgenda"
                component={TutorAgendaScreen}
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
                name="TutorHealth"
                component={TutorHealthScreen}
                options={{
                    title: 'Saúde',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="TutorProfile"
                component={TutorProfileScreen}
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

export function TutorNavigator() {
    return (
        <Stack.Navigator initialRouteName="TutorTabs">
            <Stack.Screen
                name="TutorTabs"
                component={TutorTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TutorAppointment"
                component={TutorAppointmentScreen}
                options={{ title: 'Agendar consulta' }}
            />
            <Stack.Screen
                name="TutorMedicalRecords"
                component={TutorMedicalRecordsScreen}
                options={{ title: 'Prontuário' }}
            />
            <Stack.Screen
                name="TutorMedications"
                component={TutorMedicationsScreen}
                options={{ title: 'Medicamentos' }}
            />
            <Stack.Screen
                name="TutorPetDetails"
                component={TutorPetDetailsScreen}
                options={{ title: 'Detalhes do Pet' }}
            />
            <Stack.Screen
                name="TutorProfileDetails"
                component={TutorProfileDetailsScreen}
                options={{ title: 'Dados do perfil' }}
            />
            <Stack.Screen
                name="TutorPrivacy"
                component={TutorPrivacyScreen}
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
