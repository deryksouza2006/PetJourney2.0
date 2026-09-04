import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useDeleteClinic } from '../../hooks/clinics/useDeleteClinic';
import { useClinics } from '../../hooks/clinics/useClinics';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { Clinic } from '../../types/clinic';

type Props = NativeStackScreenProps<
    SystemAdminStackParamList,
    'Clinics'
>;

export function ClinicListScreen({ navigation }: Props) {
    const { data, isPending, isError } = useClinics();
    const deleteClinic = useDeleteClinic();

    async function deleteSelectedClinic(id: number): Promise<void> {
        try {
            await deleteClinic.mutateAsync(id);
        } catch {
            Alert.alert(
                'N\u00e3o foi poss\u00edvel excluir',
                'A cl\u00ednica n\u00e3o p\u00f4de ser exclu\u00edda. Ela pode possuir dados vinculados.',
            );
        }
    }

    function confirmDelete(clinic: Clinic): void {
        if (deleteClinic.isPending) {
            return;
        }

        Alert.alert(
            `Excluir ${clinic.name}?`,
            'Essa a\u00e7\u00e3o n\u00e3o pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => void deleteSelectedClinic(clinic.id),
                },
            ],
        );
    }

    function renderClinic({ item }: { item: Clinic }) {
        return (
            <View style={styles.card}>
                <Text style={styles.clinicName}>{item.name}</Text>
                <Text style={styles.detail}>CNPJ: {item.cnpj}</Text>
                <Text style={styles.detail}>Telefone: {item.phone ?? 'N\u00e3o informado'}</Text>
                <Text style={styles.detail}>E-mail: {item.email ?? 'N\u00e3o informado'}</Text>
                <Text style={styles.detail}>Endere\u00e7o: {item.address ?? 'N\u00e3o informado'}</Text>
                <View style={styles.cardActions}>
                    <Button
                        title="Editar"
                        onPress={() =>
                            navigation.navigate('EditClinic', { clinic: item })
                        }
                        color="#2f7d6d"
                    />
                    <Button
                        title={
                            deleteClinic.isPending &&
                            deleteClinic.variables === item.id
                                ? 'Excluindo...'
                                : 'Excluir'
                        }
                        onPress={() => confirmDelete(item)}
                        disabled={deleteClinic.isPending}
                        color="#b42318"
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cl\u00ednicas</Text>
            <View style={styles.action}>
                <Button
                    title="Cadastrar cl\u00ednica"
                    onPress={() => navigation.navigate('CreateClinic')}
                    color="#2f7d6d"
                />
            </View>

            {isPending ? (
                <ActivityIndicator size="large" color="#2f7d6d" />
            ) : isError ? (
                <Text style={styles.message}>
                    N\u00e3o foi poss\u00edvel carregar as cl\u00ednicas.
                </Text>
            ) : (
                <FlatList
                    data={data.content}
                    keyExtractor={(clinic) => clinic.id.toString()}
                    renderItem={renderClinic}
                    contentContainerStyle={
                        data.content.length === 0 ? styles.emptyList : styles.list
                    }
                    ListEmptyComponent={
                        <Text style={styles.message}>
                            Nenhuma cl\u00ednica encontrada.
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
    clinicName: {
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
