import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeActionCard, HomeScreenLayout } from '../../components/HomeScreenLayout';
import { useAuth } from '../../contexts/AuthContext';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';

type Props = NativeStackScreenProps<VeterinarianStackParamList, 'VeterinarianHome'>;

export function VeterinarianHomeScreen({ navigation }: Props) {
    const { signOut } = useAuth();

    return (
        <HomeScreenLayout
            title="Área veterinária"
            description="Acesse seus pacientes e registre novos tutores com seus pets."
            onSignOut={() => void signOut()}
        >
            <HomeActionCard
                icon="PA"
                title="Pacientes"
                description="Consulte os pets disponíveis para atendimento."
                onPress={() => navigation.navigate('Patients')}
            />
            <HomeActionCard
                icon="+"
                title="Cadastrar tutor + pet"
                description="Registre um novo tutor junto com os dados do pet."
                onPress={() => navigation.navigate('RegisterTutorWithPet')}
            />
        </HomeScreenLayout>
    );
}
