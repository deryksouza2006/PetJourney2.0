import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePet } from '../../hooks/pets/usePet';
import { useTutor } from '../../hooks/tutors/useTutor';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';

type Props = NativeStackScreenProps<
    VeterinarianStackParamList,
    'PetDetails'
>;

export function VeterinarianPetDetailsScreen({ route }: Props) {
    const pet = usePet(route.params.petId);
    const tutorId = pet.data?.tutorId ?? null;
    const tutor = useTutor(tutorId);

    if (pet.isPending) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2f7d6d" />
            </View>
        );
    }

    if (pet.isError) {
        return (
            <View style={styles.centered}>
                <Text style={styles.message}>
                    Não foi possível carregar o Pet.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <Text style={styles.title}>{pet.data.name}</Text>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Pet</Text>
                <Text style={styles.detail}>Espécie: {pet.data.species}</Text>
                <Text style={styles.detail}>
                    Raça: {pet.data.breed ?? 'Não informada'}
                </Text>
                <Text style={styles.detail}>
                    Sexo: {pet.data.sex ?? 'Não informado'}
                </Text>
                <Text style={styles.detail}>
                    Nascimento: {pet.data.birthDate ?? 'Não informado'}
                </Text>
                <Text style={styles.detail}>
                    Peso:{' '}
                    {pet.data.weight !== null
                        ? `${pet.data.weight} kg`
                        : 'Não informado'}
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Tutor responsável</Text>
                {tutorId === null ? (
                    <Text style={styles.message}>Tutor não informado.</Text>
                ) : tutor.isPending ? (
                    <ActivityIndicator color="#2f7d6d" />
                ) : tutor.isError ? (
                    <Text style={styles.message}>
                        Não foi possível carregar o Tutor.
                    </Text>
                ) : (
                    <>
                        <Text style={styles.detail}>Nome: {tutor.data.name}</Text>
                        <Text style={styles.detail}>CPF: {tutor.data.cpf}</Text>
                        <Text style={styles.detail}>
                            Telefone: {tutor.data.phone ?? 'Não informado'}
                        </Text>
                        <Text style={styles.detail}>
                            E-mail: {tutor.data.email ?? 'Não informado'}
                        </Text>
                        <Text style={styles.detail}>
                            Clínica:{' '}
                            {tutor.data.clinicName ?? 'Não informada'}
                        </Text>
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f8f7',
    },
    content: {
        padding: 20,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f4f8f7',
    },
    title: {
        marginBottom: 16,
        color: '#173f37',
        fontSize: 28,
        fontWeight: '700',
    },
    card: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 10,
        backgroundColor: '#ffffff',
    },
    sectionTitle: {
        marginBottom: 8,
        color: '#173f37',
        fontSize: 18,
        fontWeight: '700',
    },
    detail: {
        marginBottom: 4,
        color: '#4b625d',
        fontSize: 15,
    },
    message: {
        color: '#4b625d',
        fontSize: 16,
        textAlign: 'center',
    },
});
