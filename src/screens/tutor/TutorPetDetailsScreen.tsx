import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { usePet } from '../../hooks/pets/usePet';
import { TutorStackParamList } from '../../navigation/TutorNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<TutorStackParamList, 'TutorPetDetails'>;

function formatBirthDate(birthDate: string | null): string {
    if (!birthDate) {
        return 'Não informada';
    }

    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);

    if (!dateParts) {
        return birthDate;
    }

    return `${dateParts[3]}/${dateParts[2]}/${dateParts[1]}`;
}

export function TutorPetDetailsScreen({ route }: Props) {
    const pet = usePet(route.params.petId);

    if (pet.isPending) {
        return (
            <SafeAreaView style={styles.centered} edges={['right', 'bottom', 'left']}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.stateMessage}>Carregando pet...</Text>
            </SafeAreaView>
        );
    }

    if (pet.isError) {
        return (
            <SafeAreaView style={styles.centered} edges={['right', 'bottom', 'left']}>
                <View style={styles.stateCard}>
                    <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                    <Text style={styles.stateMessage}>
                        Não foi possível consultar os dados deste pet agora.
                    </Text>
                    <AppButton
                        label="Tentar novamente"
                        onPress={() => void pet.refetch()}
                        variant="secondary"
                        size="small"
                        style={styles.retryButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>DETALHES DO PET</Text>
                    <View style={styles.profileHeader}>
                        <View style={styles.petIcon}>
                            <Text style={styles.petIconText}>PET</Text>
                        </View>
                        <View style={styles.profileCopy}>
                            <Text style={styles.title}>{pet.data.name}</Text>
                            <Text style={styles.profileSubtitle}>{pet.data.species}</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Dados do pet</Text>
                        <View style={styles.details}>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Nome</Text>
                                <Text style={styles.detailValue}>{pet.data.name}</Text>
                            </View>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Espécie</Text>
                                <Text style={styles.detailValue}>{pet.data.species}</Text>
                            </View>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Raça</Text>
                                <Text style={styles.detailValue}>
                                    {pet.data.breed ?? 'Não informada'}
                                </Text>
                            </View>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Sexo</Text>
                                <Text style={styles.detailValue}>
                                    {pet.data.sex ?? 'Não informado'}
                                </Text>
                            </View>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Data de nascimento</Text>
                                <Text style={styles.detailValue}>
                                    {formatBirthDate(pet.data.birthDate)}
                                </Text>
                            </View>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>Peso</Text>
                                <Text style={styles.detailValue}>
                                    {pet.data.weight !== null
                                        ? `${pet.data.weight} kg`
                                        : 'Não informado'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Tutor responsável</Text>
                        <View style={styles.tutorDetails}>
                            <Text style={styles.detailLabel}>Nome</Text>
                            <Text style={styles.detailValue}>
                                {pet.data.tutorName ?? 'Não informado'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: spacing.xl },
    wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
        backgroundColor: colors.background,
    },
    eyebrow: {
        marginBottom: spacing.md,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.4,
    },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
    petIcon: {
        width: 54,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
    },
    petIconText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
    profileCopy: { flex: 1, marginLeft: spacing.lg },
    title: {
        color: colors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    profileSubtitle: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
    },
    card: {
        marginBottom: spacing.lg,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: typography.heading,
        fontWeight: '800',
    },
    details: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.lg,
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    detailBlock: { flexGrow: 1, flexBasis: 180 },
    tutorDetails: {
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    detailLabel: {
        marginBottom: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: { color: colors.text, fontSize: typography.caption, lineHeight: 20 },
    stateCard: {
        width: '100%',
        maxWidth: 640,
        alignItems: 'center',
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
    retryButton: { marginTop: spacing.lg },
});
