import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabScreenProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    createNativeStackNavigator,
    NativeStackNavigationProp,
    NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/navigation/AppHeader';
import { useTheme } from '../contexts/ThemeContext';
import { ClinicAdminAccountScreen } from '../screens/clinicAdmin/ClinicAdminAccountScreen';
import { ClinicPetDetailsScreen } from '../screens/clinicAdmin/ClinicPetDetailsScreen';
import { ClinicAdminHomeScreen } from '../screens/clinicAdmin/ClinicAdminHomeScreen';
import { ClinicAdminPrivacyScreen } from '../screens/clinicAdmin/ClinicAdminPrivacyScreen';
import { ClinicAdminProfileScreen } from '../screens/clinicAdmin/ClinicAdminProfileScreen';
import { ClinicProfileDetailsScreen } from '../screens/clinicAdmin/ClinicProfileDetailsScreen';
import { PetFormScreen } from '../screens/clinicAdmin/PetFormScreen';
import { PetListScreen } from '../screens/clinicAdmin/PetListScreen';
import { TutorFormScreen } from '../screens/clinicAdmin/TutorFormScreen';
import { TutorListScreen } from '../screens/clinicAdmin/TutorListScreen';
import { VeterinarianDetailsScreen } from '../screens/clinicAdmin/VeterinarianDetailsScreen';
import { VeterinarianFormScreen } from '../screens/clinicAdmin/VeterinarianFormScreen';
import { VeterinarianListScreen } from '../screens/clinicAdmin/VeterinarianListScreen';
import { AboutAppScreen } from '../screens/settings/AboutAppScreen';
import { SmartCareScreen } from '../screens/smartcare/SmartCareScreen';
import { spacing, typography } from '../theme/tokens';
import { Pet } from '../types/pet';
import { Tutor } from '../types/tutor';
import { Veterinarian } from '../types/veterinarian';

export type ClinicAdminTabParamList = {
    ClinicAdminHome: undefined;
    Pets: undefined;
    ClinicTeam: undefined;
    ClinicProfile: undefined;
};

export type ClinicAdminStackParamList = {
    ClinicAdminTabs: NavigatorScreenParams<ClinicAdminTabParamList> | undefined;
    Veterinarians: undefined;
    VeterinarianDetails: { veterinarian: Veterinarian };
    CreateVeterinarian: undefined;
    EditVeterinarian: { veterinarian: Veterinarian };
    ClinicProfileDetails: undefined;
    ClinicPetDetails: { petId: number };
    CreatePet: undefined;
    EditPet: { pet: Pet };
    Tutors: undefined;
    CreateTutor: undefined;
    EditTutor: { tutor: Tutor };
    SmartCare: undefined;
    ClinicAdminAccount: undefined;
    ClinicAdminPrivacy: undefined;
    AboutApp: undefined;
};

const Stack = createNativeStackNavigator<ClinicAdminStackParamList>();
const Tab = createBottomTabNavigator<ClinicAdminTabParamList>();

type TeamProps = BottomTabScreenProps<ClinicAdminTabParamList, 'ClinicTeam'>;

function ClinicTeamScreen({ navigation }: TeamProps) {
    const parentNavigation = navigation.getParent<
        NativeStackNavigationProp<ClinicAdminStackParamList>
    >();

    return (
        <VeterinarianListScreen
            onCreateVeterinarian={() => parentNavigation?.navigate('CreateVeterinarian')}
            onOpenVeterinarian={(veterinarian) =>
                parentNavigation?.navigate('VeterinarianDetails', { veterinarian })
            }
            onOpenTutors={() => parentNavigation?.navigate('Tutors')}
        />
    );
}

type VeterinarianListStackProps = NativeStackScreenProps<
    ClinicAdminStackParamList,
    'Veterinarians'
>;

function VeterinarianListStackScreen({ navigation }: VeterinarianListStackProps) {
    return (
        <VeterinarianListScreen
            onCreateVeterinarian={() => navigation.navigate('CreateVeterinarian')}
            onOpenVeterinarian={(veterinarian) =>
                navigation.navigate('VeterinarianDetails', { veterinarian })
            }
            onOpenTutors={() => navigation.navigate('Tutors')}
        />
    );
}

function ClinicAdminTabs() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                header: () => (
                    <AppHeader contextLabel="Gestão da Clínica" />
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
                name="ClinicAdminHome"
                component={ClinicAdminHomeScreen}
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Pets"
                component={PetListScreen}
                options={{
                    title: 'Pacientes',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'paw' : 'paw-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="ClinicTeam"
                component={ClinicTeamScreen}
                options={{
                    title: 'Equipe',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="ClinicProfile"
                component={ClinicAdminProfileScreen}
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

export function ClinicAdminNavigator() {
    return (
        <Stack.Navigator initialRouteName="ClinicAdminTabs">
            <Stack.Screen
                name="ClinicAdminTabs"
                component={ClinicAdminTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Veterinarians"
                component={VeterinarianListStackScreen}
                options={{ title: 'Veterinários' }}
            />
            <Stack.Screen
                name="VeterinarianDetails"
                component={VeterinarianDetailsScreen}
                options={{ title: 'Detalhes do Veterinário' }}
            />
            <Stack.Screen
                name="CreateVeterinarian"
                component={VeterinarianFormScreen}
                options={{ title: 'Cadastrar Veterinário' }}
            />
            <Stack.Screen
                name="EditVeterinarian"
                component={VeterinarianFormScreen}
                options={{ title: 'Editar Veterinário' }}
            />
            <Stack.Screen
                name="ClinicPetDetails"
                component={ClinicPetDetailsScreen}
                options={{ title: 'Detalhes do Paciente' }}
            />
            <Stack.Screen
                name="ClinicProfileDetails"
                component={ClinicProfileDetailsScreen}
                options={{ title: 'Perfil da Clínica' }}
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
            <Stack.Screen
                name="SmartCare"
                component={SmartCareScreen}
                options={{ title: 'SmartCare' }}
            />
            <Stack.Screen
                name="ClinicAdminAccount"
                component={ClinicAdminAccountScreen}
                options={{ title: 'Dados da Conta' }}
            />
            <Stack.Screen
                name="ClinicAdminPrivacy"
                component={ClinicAdminPrivacyScreen}
                options={{ title: 'Privacidade e Dados' }}
            />
            <Stack.Screen
                name="AboutApp"
                component={AboutAppScreen}
                options={{ title: 'Sobre o App' }}
            />
        </Stack.Navigator>
    );
}
