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
                title="Cadastrar Paciente"
                description="Registre um novo tutor junto com os dados do pet."
                onPress={() => navigation.navigate('RegisterTutorWithPet')}
            />
            <HomeActionCard
                icon="HR"
                title="Minha disponibilidade"
                description="Cadastre e gerencie seus horários disponíveis."
                onPress={() => navigation.navigate('VeterinarianAvailability')}
            />
            <HomeActionCard
                icon="SC"
                title="SmartCare"
                description="Analise a prioridade de acompanhamento dos seus pacientes."
                onPress={() => navigation.navigate('SmartCare')}
            />
        </HomeScreenLayout>
    );
}
