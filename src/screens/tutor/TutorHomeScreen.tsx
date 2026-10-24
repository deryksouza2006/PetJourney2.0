import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TutorMedicationSummary } from '../../components/tutor/TutorMedicationSummary';
import { TutorNextAppointmentCard } from '../../components/tutor/TutorNextAppointmentCard';
import { TutorPetAvatarList } from '../../components/tutor/TutorPetAvatarList';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppointmentsByPet } from '../../hooks/appointments/useAppointmentsByPet';
import { useMedicationsByPet } from '../../hooks/medications/useMedicationsByPet';
import { usePets } from '../../hooks/pets/usePets';
import { TutorStackParamList, TutorTabParamList } from '../../navigation/TutorNavigator';
import { spacing, ThemeColors, typography } from '../../theme/tokens';

type Props = CompositeScreenProps<
    BottomTabScreenProps<TutorTabParamList, 'TutorHome'>,
    NativeStackScreenProps<TutorStackParamList>
>;

const HOME_QUERY_SIZE = 100;

function getGreeting(date = new Date()): string {
    const hour = date.getHours();

    if (hour < 12) {
        return 'Bom dia';
    }

    if (hour < 18) {
        return 'Boa tarde';
    }

    return 'Boa noite';
}

function getFriendlyUsername(username: string | undefined): string | null {
    const value = username?.trim();

    return value && !value.includes('@') ? value : null;
}

export function TutorHomeScreen({ navigation }: Props) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const pets = usePets(0, HOME_QUERY_SIZE);
    const highlightedPet = pets.data?.content[0] ?? null;
    const appointments = useAppointmentsByPet(highlightedPet?.id ?? null, 0, HOME_QUERY_SIZE);
    const medications = useMedicationsByPet(highlightedPet?.id ?? null, 0, HOME_QUERY_SIZE);
    const friendlyUsername = getFriendlyUsername(user?.username);

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: spacing.xxl + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentInner}>
                    <View style={styles.greetingBlock}>
                        <Text style={styles.greetingLabel}>
                            {getGreeting().toLocaleUpperCase('pt-BR')}
                        </Text>
                        <Text style={styles.greetingName}>{friendlyUsername || 'Olá!'}</Text>
                        <Text style={styles.greetingDescription}>
                            Cuide da saúde e da rotina dos seus pets.
                        </Text>
                    </View>

                    <TutorNextAppointmentCard
                        pet={highlightedPet}
                        appointments={appointments.data?.content ?? []}
                        isPetLoading={pets.isPending}
                        isPetError={pets.isError}
                        isAppointmentLoading={appointments.isPending}
                        isAppointmentError={appointments.isError}
                        onRetry={() => void appointments.refetch()}
                        onSchedule={() => navigation.navigate('TutorAppointment')}
                    />

                    <TutorPetAvatarList
                        pets={pets.data?.content ?? []}
                        isLoading={pets.isPending}
                        isError={pets.isError}
                        onRetry={() => void pets.refetch()}
                        onPetPress={(petId) => navigation.navigate('TutorPetDetails', { petId })}
                    />

                    <TutorMedicationSummary
                        petName={highlightedPet?.name ?? null}
                        medications={medications.data?.content ?? []}
                        isLoading={pets.isPending || (highlightedPet !== null && medications.isPending)}
                        isError={pets.isError || medications.isError}
                        onRetry={() => {
                            if (pets.isError) {
                                void pets.refetch();
                                return;
                            }

                            void medications.refetch();
                        }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scrollView: { flex: 1, backgroundColor: colors.background },
        content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
        contentInner: { width: '100%', maxWidth: 760, alignSelf: 'center' },
        greetingBlock: { marginBottom: spacing.xl },
        greetingLabel: {
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.4,
        },
        greetingName: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        greetingDescription: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
    });
}
