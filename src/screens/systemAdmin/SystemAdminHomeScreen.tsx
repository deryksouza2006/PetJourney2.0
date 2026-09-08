import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeActionCard, HomeScreenLayout } from '../../components/HomeScreenLayout';
import { useAuth } from '../../contexts/AuthContext';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';

type Props = NativeStackScreenProps<SystemAdminStackParamList, 'SystemAdminHome'>;

export function SystemAdminHomeScreen({ navigation }: Props) {
    const { signOut } = useAuth();

    return (
        <HomeScreenLayout
            title="Administração do sistema"
            description="Gerencie a estrutura de clínicas da plataforma PetJourney."
            onSignOut={() => void signOut()}
        >
            <HomeActionCard
                icon="CL"
                title="Clínicas"
                description="Consulte, cadastre e gerencie clínicas e seus administradores."
                onPress={() => navigation.navigate('Clinics')}
            />
        </HomeScreenLayout>
    );
}
