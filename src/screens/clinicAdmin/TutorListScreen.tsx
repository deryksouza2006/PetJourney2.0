import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTutors } from '../../hooks/tutors/useTutors';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { Tutor } from '../../types/tutor';

type Props = NativeStackScreenProps<ClinicAdminStackParamList, 'Tutors'>;

export function TutorListScreen({ navigation }: Props) {
    const { data, isPending, isError } = useTutors();

    function renderTutor({ item }: { item: Tutor }) {
        return (
            <View style={styles.card}>
                <Text style={styles.tutorName}>{item.name}</Text>
                <Text style={styles.detail}>CPF: {item.cpf}</Text>
                <Text style={styles.detail}>
                    Telefone: {item.phone ?? 'N\u00e3o informado'}
                </Text>
                <Text style={styles.detail}>
                    E-mail: {item.email ?? 'N\u00e3o informado'}
                </Text>
                <Text style={styles.detail}>
                    Cl\u00ednica: {item.clinicName ?? 'N\u00e3o informada'}
                </Text>
                <View style={styles.cardActions}>
                    <Button
                        title="Editar"
                        onPress={() =>
                            navigation.navigate('EditTutor', { tutor: item })
                        }
                        color="#2f7d6d"
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tutores</Text>
            <View style={styles.action}>
                <Button
                    title="Cadastrar Tutor"
                    onPress={() => navigation.navigate('CreateTutor')}
                    color="#2f7d6d"
                />
            </View>

            {isPending ? (
                <ActivityIndicator size="large" color="#2f7d6d" />
            ) : isError ? (
                <Text style={styles.message}>
                    N\u00e3o foi poss\u00edvel carregar os tutores.
                </Text>
            ) : (
                <FlatList
                    data={data.content}
                    keyExtractor={(tutor) => tutor.id.toString()}
                    renderItem={renderTutor}
                    contentContainerStyle={
                        data.content.length === 0 ? styles.emptyList : styles.list
                    }
                    ListEmptyComponent={
                        <Text style={styles.message}>
                            Nenhum tutor encontrado.
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
    tutorName: {
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
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    message: {
        color: '#4b625d',
        fontSize: 16,
        textAlign: 'center',
    },
});
