import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePet } from '../../hooks/pets/usePet';
import { useTutor } from '../../hooks/tutors/useTutor';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<VeterinarianStackParamList, 'PetDetails'>;

export function VeterinarianPetDetailsScreen({ route }: Props) {
    const pet = usePet(route.params.petId);
    const tutorId = pet.data?.tutorId ?? null;
    const tutor = useTutor(tutorId);

    if (pet.isPending) {
        return (
            <SafeAreaView style={styles.centered} edges={['right', 'bottom', 'left']}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.stateMessage}>Carregando paciente...</Text>
            </SafeAreaView>
        );
    }

    if (pet.isError) {
        return (
            <SafeAreaView style={styles.centered} edges={['right', 'bottom', 'left']}>
                <View style={styles.stateCard}>
                    <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                    <Text style={styles.stateMessage}>Não foi possível carregar o Pet.</Text>
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
                    <Text style={styles.eyebrow}>DETALHES DO PACIENTE</Text>
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
                                <Text style={styles.detailLabel}>Nascimento</Text>
                                <Text style={styles.detailValue}>
                                    {pet.data.birthDate ?? 'Não informado'}
                                </Text>
                            </View>
                            <View style={styles.detailBlockWide}>
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
                        {tutorId === null ? (
                            <Text style={styles.inlineMessage}>Tutor não informado.</Text>
                        ) : tutor.isPending ? (
                            <View style={styles.inlineState}>
                                <ActivityIndicator color={colors.primary} />
                                <Text style={styles.inlineStateMessage}>Carregando Tutor...</Text>
                            </View>
                        ) : tutor.isError ? (
                            <View style={styles.inlineError}>
                                <Text style={styles.errorMessage}>
                                    Não foi possível carregar o Tutor.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.details}>
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>Nome</Text>
                                    <Text style={styles.detailValue}>{tutor.data.name}</Text>
                                </View>
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>CPF</Text>
                                    <Text style={styles.detailValue}>{tutor.data.cpf}</Text>
                                </View>
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>Telefone</Text>
                                    <Text style={styles.detailValue}>
                                        {tutor.data.phone ?? 'Não informado'}
                                    </Text>
                                </View>
                                <View style={styles.detailBlock}>
                                    <Text style={styles.detailLabel}>E-mail</Text>
                                    <Text style={styles.detailValue}>
                                        {tutor.data.email ?? 'Não informado'}
                                    </Text>
                                </View>
                                <View style={styles.detailBlockWide}>
                                    <Text style={styles.detailLabel}>Clínica</Text>
                                    <Text style={styles.detailValue}>
                                        {tutor.data.clinicName ?? 'Não informada'}
                                    </Text>
                                </View>
                            </View>
                        )}
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
    inlineState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    inlineMessage: {
        marginTop: spacing.lg,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    inlineStateMessage: {
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    inlineError: {
        marginTop: spacing.lg,
        padding: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
        borderRadius: radii.sm,
        backgroundColor: '#FDF0F0',
    },
    errorMessage: { color: colors.danger, fontSize: typography.caption, lineHeight: 20 },
    stateCard: {
        width: '100%',
        maxWidth: 640,
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
