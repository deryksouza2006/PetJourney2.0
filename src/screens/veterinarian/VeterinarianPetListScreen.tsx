import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { usePets } from '../../hooks/pets/usePets';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';
import { Pet } from '../../types/pet';

type Props = NativeStackScreenProps<
    VeterinarianStackParamList,
    'Patients'
>;

export function VeterinarianPetListScreen({ navigation }: Props) {
    const { data, isPending, isError } = usePets();

    function renderPet({ item }: { item: Pet }) {
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                ]}
                onPress={() =>
                    navigation.navigate('PetDetails', { petId: item.id })
                }
            >
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.detail}>Espécie: {item.species}</Text>
                <Text style={styles.detail}>
                    Tutor: {item.tutorName ?? 'Não informado'}
                </Text>
            </Pressable>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pacientes</Text>

            {isPending ? (
                <ActivityIndicator size="large" color="#2f7d6d" />
            ) : isError ? (
                <Text style={styles.message}>
                    Não foi possível carregar os Pets.
                </Text>
            ) : (
                <FlatList
                    data={data.content}
                    keyExtractor={(pet) => pet.id.toString()}
                    renderItem={renderPet}
                    contentContainerStyle={
                        data.content.length === 0 ? styles.emptyList : styles.list
                    }
                    ListEmptyComponent={
                        <Text style={styles.message}>
                            Nenhum Pet encontrado.
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f4f8f7',
    },
    title: {
        marginBottom: 16,
        color: '#173f37',
        fontSize: 28,
        fontWeight: '700',
    },
    list: {
        paddingBottom: 20,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    card: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 10,
        backgroundColor: '#ffffff',
    },
    cardPressed: {
        opacity: 0.85,
    },
    petName: {
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
