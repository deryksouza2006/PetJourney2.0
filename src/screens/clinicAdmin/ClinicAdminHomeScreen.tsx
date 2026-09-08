import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeActionCard, HomeScreenLayout } from '../../components/HomeScreenLayout';
import { useAuth } from '../../contexts/AuthContext';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';

type Props = NativeStackScreenProps<ClinicAdminStackParamList, 'ClinicAdminHome'>;

export function ClinicAdminHomeScreen({ navigation }: Props) {
    const { signOut } = useAuth();

    return (
        <HomeScreenLayout
            title="Administração da clínica"
            description="Organize os profissionais, tutores e pets atendidos pela clínica."
            onSignOut={() => void signOut()}
        >
            <HomeActionCard
                icon="VE"
                title="Veterinários"
                description="Consulte e gerencie os profissionais da clínica."
                onPress={() => navigation.navigate('Veterinarians')}
            />
            <HomeActionCard
                icon="TU"
                title="Tutores"
                description="Acesse os cadastros de responsáveis pelos pets."
                onPress={() => navigation.navigate('Tutors')}
            />
            <HomeActionCard
                icon="PE"
                title="Pets"
                description="Consulte e gerencie os pets cadastrados."
                onPress={() => navigation.navigate('Pets')}
            />
        </HomeScreenLayout>
    );
}
