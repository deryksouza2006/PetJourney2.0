import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ComponentProps } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { PetAvatar } from '../../components/veterinarian/PetAvatar';
import { useDeletePet } from '../../hooks/pets/useDeletePet';
import { usePet } from '../../hooks/pets/usePet';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { colors, createThemedStyles, radii, shadows, spacing, typography } from '../../theme/tokens';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatLocalDate } from '../../utils/dateTimeFormatting';
import {
    formatPetAge,
    PET_SEX_LABELS,
    PET_SPECIES_LABELS,
} from '../../utils/petPresentation';

type Props = NativeStackScreenProps<ClinicAdminStackParamList, 'ClinicPetDetails'>;
type IconName = ComponentProps<typeof Ionicons>['name'];

interface InformationRowProps {
    icon: IconName;
    label: string;
    value: string;
    showDivider?: boolean;
}

function InformationRow({ icon, label, value, showDivider = false }: InformationRowProps) {
    return (
        <>
            {showDivider ? <View style={styles.divider} /> : null}
            <View style={styles.informationRow}>
                <View style={styles.informationIcon}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.informationCopy}>
                    <Text style={styles.informationLabel}>{label}</Text>
                    <Text style={styles.informationValue}>{value}</Text>
                </View>
            </View>
        </>
    );
}

export function ClinicPetDetailsScreen({ navigation, route }: Props) {
    const insets = useSafeAreaInsets();
    const pet = usePet(route.params.petId);
    const deletePet = useDeletePet();

    async function deleteSelectedPet(): Promise<void> {
        try {
            await deletePet.mutateAsync(route.params.petId);
            Alert.alert('Paciente excluído', 'O cadastro foi removido com sucesso.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error: unknown) {
            Alert.alert(
                'Não foi possível excluir',
                getApiErrorMessage(error, 'Não foi possível excluir o paciente. Tente novamente.'),
            );
        }
    }

    function confirmDelete(): void {
        if (!pet.data || deletePet.isPending) {
            return;
        }

        Alert.alert(
            `Excluir ${pet.data.name}?`,
            'Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => void deleteSelectedPet(),
                },
            ],
        );
    }

    if (pet.isPending) {
        return (
            <SafeAreaView style={styles.centeredState} edges={['right', 'bottom', 'left']}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.stateMessage}>Carregando paciente...</Text>
            </SafeAreaView>
        );
    }

    if (pet.isError) {
        return (
            <SafeAreaView style={styles.centeredState} edges={['right', 'bottom', 'left']}>
                <View style={styles.stateIcon}>
                    <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
                </View>
                <Text style={styles.stateTitle}>Não foi possível carregar o paciente.</Text>
                <Text style={styles.stateMessage}>Verifique sua conexão e tente novamente.</Text>
                <AppButton
                    label="Tentar novamente"
                    variant="secondary"
                    size="small"
                    onPress={() => void pet.refetch()}
                />
            </SafeAreaView>
        );
    }

    const age = formatPetAge(pet.data.birthDate);
    const breed = pet.data.breed?.trim();
    const tutorName = pet.data.tutorName?.trim();

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: spacing.xxl + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <View style={styles.profileCard}>
                        <PetAvatar size={76} />
                        <Text style={styles.name}>{pet.data.name}</Text>
                        <Text style={styles.profileSubtitle}>
                            {breed || PET_SPECIES_LABELS[pet.data.species]}
                            {age ? ` · ${age}` : ''}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>DADOS DO PACIENTE</Text>
                        <View style={styles.surface}>
                            <InformationRow
                                icon="paw-outline"
                                label="Espécie"
                                value={PET_SPECIES_LABELS[pet.data.species]}
                            />
                            {breed ? (
                                <InformationRow
                                    icon="information-circle-outline"
                                    label="Raça"
                                    value={breed}
                                    showDivider
                                />
                            ) : null}
                            {pet.data.sex ? (
                                <InformationRow
                                    icon="male-female-outline"
                                    label="Sexo"
                                    value={PET_SEX_LABELS[pet.data.sex]}
                                    showDivider
                                />
                            ) : null}
                            {pet.data.birthDate ? (
                                <InformationRow
                                    icon="calendar-outline"
                                    label="Nascimento"
                                    value={formatLocalDate(pet.data.birthDate)}
                                    showDivider
                                />
                            ) : null}
                            {pet.data.weight !== null ? (
                                <InformationRow
                                    icon="scale-outline"
                                    label="Peso"
                                    value={`${pet.data.weight} kg`}
                                    showDivider
                                />
                            ) : null}
                        </View>
                    </View>

                    {tutorName ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>TUTOR RESPONSÁVEL</Text>
                            <View style={styles.surface}>
                                <InformationRow
                                    icon="person-outline"
                                    label="Nome"
                                    value={tutorName}
                                />
                            </View>
                        </View>
                    ) : null}

                    <View style={styles.actions}>
                        <AppButton
                            label="Editar cadastro"
                            variant="secondary"
                            onPress={() => navigation.navigate('EditPet', { pet: pet.data })}
                            disabled={deletePet.isPending}
                            style={styles.action}
                        />
                        <AppButton
                            label="Excluir"
                            variant="danger"
                            onPress={confirmDelete}
                            loading={deletePet.isPending}
                            style={styles.action}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = createThemedStyles((themeColors) => ({
    safeArea: { flex: 1, backgroundColor: themeColors.background },
    scrollView: { flex: 1, backgroundColor: themeColors.background },
    content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
    wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
    profileCard: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
        ...shadows.card,
    },
    name: {
        marginTop: spacing.md,
        color: themeColors.text,
        fontSize: typography.title,
        fontWeight: '800',
        textAlign: 'center',
    },
    profileSubtitle: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    section: { marginBottom: spacing.xxl },
    sectionTitle: {
        marginBottom: spacing.md,
        color: themeColors.text,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    surface: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    informationRow: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
    },
    informationIcon: {
        width: 40,
        height: 40,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: themeColors.primarySoft,
    },
    informationCopy: { minWidth: 0, flex: 1, marginLeft: spacing.md },
    informationLabel: {
        color: themeColors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
    },
    informationValue: {
        marginTop: spacing.xs,
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '700',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginLeft: 40 + spacing.lg + spacing.md,
        backgroundColor: themeColors.border,
    },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    action: { minWidth: 150, flex: 1 },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
        backgroundColor: themeColors.background,
    },
    stateIcon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: themeColors.primarySoft,
    },
    stateTitle: {
        color: themeColors.text,
        fontSize: typography.body,
        fontWeight: '800',
        textAlign: 'center',
    },
    stateMessage: {
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
}));
