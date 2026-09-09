import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaginationControls } from '../../components/PaginationControls';
import { usePets } from '../../hooks/pets/usePets';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { Pet } from '../../types/pet';

type Props = NativeStackScreenProps<VeterinarianStackParamList, 'Patients'>;

export function VeterinarianPetListScreen({ navigation }: Props) {
    const [page, setPage] = useState(0);
    const { data, isPending, isError, isFetching } = usePets(page, DEFAULT_PAGE_SIZE);

    function renderPet({ item }: { item: Pet }) {
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver detalhes de ${item.name}`}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => navigation.navigate('PetDetails', { petId: item.id })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.petIcon}>
                        <Text style={styles.petIconText}>PET</Text>
                    </View>
                    <View style={styles.cardHeaderCopy}>
                        <Text style={styles.petName}>{item.name}</Text>
                        <Text style={styles.species}>{item.species}</Text>
                    </View>
                    <Text style={styles.arrow} accessibilityElementsHidden>›</Text>
                </View>

                <View style={styles.details}>
                    <View style={styles.detailBlock}>
                        <Text style={styles.detailLabel}>Raça</Text>
                        <Text style={styles.detailValue}>{item.breed ?? 'Não informada'}</Text>
                    </View>
                    <View style={styles.detailBlock}>
                        <Text style={styles.detailLabel}>Sexo</Text>
                        <Text style={styles.detailValue}>{item.sex ?? 'Não informado'}</Text>
                    </View>
                    <View style={styles.detailBlockWide}>
                        <Text style={styles.detailLabel}>Tutor responsável</Text>
                        <Text style={styles.detailValue}>{item.tutorName ?? 'Não informado'}</Text>
                    </View>
                </View>
            </Pressable>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <Text style={styles.eyebrow}>ATENDIMENTO</Text>
                    <Text style={styles.title}>Pacientes</Text>
                    <Text style={styles.description}>
                        Consulte os pets disponíveis para atendimento.
                    </Text>
                </View>

                {isPending ? (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando pacientes...</Text>
                    </View>
                ) : isError ? (
                    <View style={styles.stateCard}>
                        <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                        <Text style={styles.stateMessage}>
                            Não foi possível carregar os Pets.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        style={styles.listContainer}
                        data={data.content}
                        keyExtractor={(pet) => pet.id.toString()}
                        renderItem={renderPet}
                        contentContainerStyle={
                            data.content.length === 0 ? styles.emptyList : styles.list
                        }
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.stateCard}>
                                <Text style={styles.stateTitle}>Nenhum Pet encontrado.</Text>
                                <Text style={styles.stateMessage}>
                                    Não há pacientes disponíveis no momento.
                                </Text>
                            </View>
                        }
                        ListFooterComponent={
                            <PaginationControls
                                page={data.number}
                                totalPages={data.totalPages}
                                isFirst={data.first}
                                isLast={data.last}
                                disabled={isFetching}
                                onPrevious={() => setPage(data.number - 1)}
                                onNext={() => setPage(data.number + 1)}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.background,
    },
    heading: {
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        paddingVertical: spacing.xl,
    },
    eyebrow: {
        marginBottom: spacing.sm,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.4,
    },
    title: {
        color: colors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    description: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 23,
    },
    listContainer: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' },
    list: { paddingBottom: spacing.xxl },
    emptyList: { flexGrow: 1, justifyContent: 'center', paddingBottom: spacing.xxl },
    card: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    cardPressed: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
        transform: [{ scale: 0.99 }],
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    petIcon: {
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
    },
    petIconText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
    cardHeaderCopy: { flex: 1, marginLeft: spacing.md },
    petName: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    species: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
    },
    arrow: { color: colors.primary, fontSize: 30, fontWeight: '400' },
    details: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.lg,
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    detailBlock: { flexGrow: 1, flexBasis: 130 },
    detailBlockWide: { width: '100%' },
    detailLabel: {
        marginBottom: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: { color: colors.text, fontSize: typography.caption, lineHeight: 20 },
    stateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    stateCard: {
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
    },
    stateTitle: {
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '800',
        textAlign: 'center',
    },
    stateMessage: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
});
