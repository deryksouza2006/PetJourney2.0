import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useClinics } from '../../hooks/clinics/useClinics';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { Clinic } from '../../types/clinic';

type Props = NativeStackScreenProps<
    SystemAdminStackParamList,
    'Clinics'
>;

export function ClinicListScreen({ navigation }: Props) {
    const { data, isPending, isError } = useClinics();

    function renderClinic({ item }: { item: Clinic }) {
        return (
            <View style={styles.card}>
                <Text style={styles.clinicName}>{item.name}</Text>
                <Text style={styles.detail}>CNPJ: {item.cnpj}</Text>
                <Text style={styles.detail}>Telefone: {item.phone ?? 'N\u00e3o informado'}</Text>
                <Text style={styles.detail}>E-mail: {item.email ?? 'N\u00e3o informado'}</Text>
                <Text style={styles.detail}>Endere\u00e7o: {item.address ?? 'N\u00e3o informado'}</Text>
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
    message: {
        color: '#4b625d',
        fontSize: 16,
        textAlign: 'center',
    },
});
