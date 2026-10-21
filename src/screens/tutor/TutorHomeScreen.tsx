import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { BrandMark } from '../../components/BrandMark';
import { useAuth } from '../../contexts/AuthContext';
import { usePets } from '../../hooks/pets/usePets';
import { TutorStackParamList } from '../../navigation/TutorNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<TutorStackParamList, 'TutorHome'>;

export function TutorHomeScreen({ navigation }: Props) {
    const { user, signOut } = useAuth();
    const pets = usePets();
    const insets = useSafeAreaInsets();
    const firstPet = pets.data?.content[0];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View style={styles.headerInner}>
                    <View style={styles.topBar}>
                        <BrandMark compact light />
                        <AppButton
                            label="Sair"
                            onPress={() => void signOut()}
                            variant="secondary"
                            size="small"
                            style={styles.signOutButton}
                        />
                    </View>
                    <Text style={styles.eyebrow}>ÁREA DO TUTOR</Text>
                    <Text style={styles.title}>Olá, {user?.username ?? 'Tutor'}!</Text>
                    <Text style={styles.description}>
                        Acompanhe os dados dos seus pets em um só lugar.
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: spacing.xxl + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentInner}>
                    <Text style={styles.sectionTitle}>Seu pet</Text>
                    <Text style={styles.sectionDescription}>
                        Um resumo do primeiro pet vinculado à sua conta.
                    </Text>

                    {pets.isPending ? (
                        <View style={styles.stateCard}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.stateMessage}>Carregando seus pets...</Text>
                        </View>
                    ) : pets.isError ? (
                        <View style={styles.stateCard}>
                            <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                            <Text style={styles.stateMessage}>
                                Não foi possível consultar seus pets agora.
                            </Text>
                            <AppButton
                                label="Tentar novamente"
                                onPress={() => void pets.refetch()}
                                variant="secondary"
                                size="small"
                                style={styles.retryButton}
                            />
                        </View>
                    ) : firstPet ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Ver detalhes de ${firstPet.name}`}
                            style={({ pressed }) => [
                                styles.petCard,
                                pressed && styles.petCardPressed,
                            ]}
                            onPress={() => navigation.navigate('TutorPetDetails', {
                                petId: firstPet.id,
                            })}
                        >
                            <View style={styles.petIcon}>
                                <Text style={styles.petIconText}>PET</Text>
                            </View>
                            <View style={styles.petCopy}>
                                <Text style={styles.petName}>{firstPet.name}</Text>
                                <Text style={styles.petSpecies}>{firstPet.species}</Text>
                                <Text style={styles.petSummary}>
                                    {firstPet.breed ?? 'Raça não informada'}
                                    {' • '}
                                    {firstPet.weight !== null
                                        ? `${firstPet.weight} kg`
                                        : 'Peso não informado'}
                                </Text>
                            </View>
                            <Text style={styles.arrow} accessibilityElementsHidden>›</Text>
                        </Pressable>
                    ) : (
                        <View style={styles.stateCard}>
                            <Text style={styles.stateTitle}>Nenhum pet encontrado</Text>
                            <Text style={styles.stateMessage}>
                                Ainda não há pets vinculados à sua conta.
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.sectionTitle, styles.accessTitle]}>Acesso rápido</Text>
                    <Text style={styles.sectionDescription}>
                        Consulte todos os pets vinculados à sua conta.
                    </Text>
                    <AppButton
                        label="Ver meus pets"
                        onPress={() => navigation.navigate('TutorPets')}
                        style={styles.petsButton}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.text },
    header: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxxl,
        backgroundColor: colors.text,
    },
    headerInner: { width: '100%', maxWidth: 720, alignSelf: 'center' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        marginBottom: spacing.xxxl,
    },
    signOutButton: {
        minHeight: 42,
        borderColor: colors.overlayLight,
        backgroundColor: colors.overlayLight,
    },
    eyebrow: {
        marginBottom: spacing.sm,
        color: '#8FC9F4',
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    title: {
        color: colors.white,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.6,
    },
    description: {
        maxWidth: 560,
        marginTop: spacing.sm,
        color: '#C7D0D7',
        fontSize: typography.body,
        lineHeight: 23,
    },
    scrollView: {
        flex: 1,
        borderTopLeftRadius: radii.lg,
        borderTopRightRadius: radii.lg,
        backgroundColor: colors.background,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxl,
    },
    contentInner: { width: '100%', maxWidth: 720, alignSelf: 'center' },
    sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    sectionDescription: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    petCard: {
        minHeight: 112,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    petCardPressed: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
        transform: [{ scale: 0.99 }],
    },
    petIcon: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
    },
    petIconText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
    petCopy: { flex: 1, marginHorizontal: spacing.lg },
    petName: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    petSpecies: {
        marginTop: spacing.xs,
        color: colors.primary,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    petSummary: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    arrow: { color: colors.primary, fontSize: 30, fontWeight: '400' },
    stateCard: {
        alignItems: 'center',
        marginTop: spacing.xl,
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
    accessTitle: { marginTop: spacing.xxxl },
    petsButton: { marginTop: spacing.xl },
});
