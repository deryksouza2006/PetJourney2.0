import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDeletePet } from '../../hooks/pets/useDeletePet';
import { usePets } from '../../hooks/pets/usePets';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { Pet } from '../../types/pet';

type Props = NativeStackScreenProps<ClinicAdminStackParamList, 'Pets'>;

export function PetListScreen({ navigation }: Props) {
    const { data, isPending, isError } = usePets();
    const deletePet = useDeletePet();

    async function deleteSelectedPet(id: number): Promise<void> {
        try {
            await deletePet.mutateAsync(id);
        } catch (error: unknown) {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 409
            ) {
                Alert.alert(
                    'Não foi possível excluir',
                    'O Pet possui dados vinculados e não pode ser excluído.',
                );
                return;
            }

            Alert.alert(
                'Não foi possível excluir',
                'O Pet não pôde ser excluído.',
            );
        }
    }

    function confirmDelete(pet: Pet): void {
        if (deletePet.isPending) {
            return;
        }

        Alert.alert(
            `Excluir ${pet.name}?`,
            'Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => void deleteSelectedPet(pet.id),
                },
            ],
        );
    }

    function renderPet({ item }: { item: Pet }) {
        return (
            <View style={styles.card}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.detail}>Espécie: {item.species}</Text>
                <Text style={styles.detail}>
                    Raça: {item.breed ?? 'Não informada'}
                </Text>
                <Text style={styles.detail}>
                    Sexo: {item.sex ?? 'Não informado'}
                </Text>
                <Text style={styles.detail}>
                    Nascimento: {item.birthDate ?? 'Não informado'}
                </Text>
                <Text style={styles.detail}>
                    Peso: {item.weight !== null ? `${item.weight} kg` : 'Não informado'}
                </Text>
                <Text style={styles.detail}>
                    Tutor: {item.tutorName ?? 'Não informado'}
                </Text>
                <View style={styles.cardActions}>
                    <Button
                        title="Editar"
                        onPress={() =>
                            navigation.navigate('EditPet', { pet: item })
                        }
                        color="#2f7d6d"
                    />
                    <Button
                        title={
                            deletePet.isPending &&
                            deletePet.variables === item.id
                                ? 'Excluindo...'
                                : 'Excluir'
                        }
                        onPress={() => confirmDelete(item)}
                        disabled={deletePet.isPending}
                        color="#b42318"
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pets</Text>
            <View style={styles.action}>
                <Button
                    title="Cadastrar Pet"
                    onPress={() => navigation.navigate('CreatePet')}
                    color="#2f7d6d"
                />
            </View>

            {isPending ? (
                <ActivityIndicator size="large" color="#2f7d6d" />
            ) : isError ? (
                <Text style={styles.message}>
                    Não foi possível carregar os pets.
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
                        <Text style={styles.message}>Nenhum pet encontrado.</Text>
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
        marginBottom: 12,
        color: '#173f37',
        fontSize: 28,
        fontWeight: '700',
    },
    action: {
        marginBottom: 16,
        alignItems: 'flex-start',
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
    cardActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    message: {
        color: '#4b625d',
        fontSize: 16,
        textAlign: 'center',
    },
});
