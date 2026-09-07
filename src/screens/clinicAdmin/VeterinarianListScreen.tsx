import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useDeleteVeterinarian } from '../../hooks/veterinarians/useDeleteVeterinarian';
import { useVeterinarians } from '../../hooks/veterinarians/useVeterinarians';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { Veterinarian } from '../../types/veterinarian';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<
    ClinicAdminStackParamList,
    'Veterinarians'
>;

export function VeterinarianListScreen({ navigation }: Props) {
    const { data, isPending, isError } = useVeterinarians();
    const deleteVeterinarian = useDeleteVeterinarian();

    async function deleteSelectedVeterinarian(id: number): Promise<void> {
        try {
            await deleteVeterinarian.mutateAsync(id);
        } catch {
            Alert.alert(
                'N\u00e3o foi poss\u00edvel excluir',
                'O veterin\u00e1rio n\u00e3o p\u00f4de ser exclu\u00eddo. Ele pode possuir dados vinculados.',
            );
        }
    }

    function confirmDelete(veterinarian: Veterinarian): void {
        if (deleteVeterinarian.isPending) {
            return;
        }

        Alert.alert(
            `Excluir ${veterinarian.name}?`,
            'Essa a\u00e7\u00e3o n\u00e3o pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () =>
                        void deleteSelectedVeterinarian(veterinarian.id),
                },
            ],
        );
    }

    function renderVeterinarian({ item }: { item: Veterinarian }) {
        return (
            <View style={styles.card}>
                <Text style={styles.veterinarianName}>{item.name}</Text>
                <Text style={styles.detail}>CRMV: {item.crmv}</Text>
                <Text style={styles.detail}>
                    Telefone: {item.phone ?? 'N\u00e3o informado'}
                </Text>
                <Text style={styles.detail}>
                    E-mail: {item.email ?? 'N\u00e3o informado'}
                </Text>
                <Text style={styles.detail}>
                    Especialidade: {item.specialty ?? 'N\u00e3o informada'}
                </Text>
                <Text style={styles.detail}>
                    Cl\u00ednica: {item.clinicName ?? 'N\u00e3o informada'}
                </Text>
                <View style={styles.cardActions}>
                    <Button
                        title="Editar"
                        onPress={() =>
                            navigation.navigate('EditVeterinarian', {
                                veterinarian: item,
                            })
                        }
                        color="#2f7d6d"
                    />
                    <Button
                        title={
                            deleteVeterinarian.isPending &&
                            deleteVeterinarian.variables === item.id
                                ? 'Excluindo...'
                                : 'Excluir'
                        }
                        onPress={() => confirmDelete(item)}
                        disabled={deleteVeterinarian.isPending}
                        color="#b42318"
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Veterin\u00e1rios</Text>
            <View style={styles.action}>
                <Button
                    title="Cadastrar veterin\u00e1rio"
                    onPress={() => navigation.navigate('CreateVeterinarian')}
                    color="#2f7d6d"
                />
            </View>

            {isPending ? (
                <ActivityIndicator size="large" color="#2f7d6d" />
            ) : isError ? (
                <Text style={styles.message}>
                    N\u00e3o foi poss\u00edvel carregar os veterin\u00e1rios.
                </Text>
            ) : (
                <FlatList
                    data={data.content}
                    keyExtractor={(veterinarian) => veterinarian.id.toString()}
                    renderItem={renderVeterinarian}
                    contentContainerStyle={
                        data.content.length === 0 ? styles.emptyList : styles.list
                    }
                    ListEmptyComponent={
                        <Text style={styles.message}>
                            Nenhum veterin\u00e1rio encontrado.
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
    action: {
        marginBottom: 20,
        alignSelf: 'flex-start',
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
    veterinarianName: {
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
