import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicManagementRow } from '../../components/clinicAdmin/ClinicManagementRow';
import {
    ClinicAdminStackParamList,
    ClinicAdminTabParamList,
} from '../../navigation/ClinicAdminNavigator';
import { createThemedStyles, radii, spacing, typography } from '../../theme/tokens';

type Props = CompositeScreenProps<
    BottomTabScreenProps<ClinicAdminTabParamList, 'ClinicManagement'>,
    NativeStackScreenProps<ClinicAdminStackParamList>
>;

export function ClinicManagementScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();

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
                    <Text style={styles.eyebrow}>GESTÃO</Text>
                    <Text style={styles.title}>Gestão da clínica</Text>
                    <Text style={styles.description}>
                        Acesse informações e relatórios administrativos.
                    </Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>OPERAÇÕES</Text>
                        <View style={styles.surface}>
                            <ClinicManagementRow
                                icon="business-outline"
                                title="Perfil da Clínica"
                                description="Dados e informações da clínica"
                                onPress={() => navigation.navigate('ClinicProfileDetails')}
                            />
                            <View style={styles.divider} />
                            <ClinicManagementRow
                                icon="people-outline"
                                title="Equipe"
                                description="Veterinários e gestão da equipe"
                                onPress={() => navigation.navigate('ClinicTeam')}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>RELATÓRIOS</Text>
                        <View style={styles.surface}>
                            <ClinicManagementRow
                                icon="bar-chart-outline"
                                title="Relatórios da Clínica"
                                description="Pets e acompanhamento de peso"
                                onPress={() => navigation.navigate('ClinicReports')}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = createThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
    wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
    eyebrow: {
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    title: {
        marginTop: spacing.xs,
        color: colors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    description: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    section: { marginTop: spacing.xxl },
    sectionTitle: {
        marginBottom: spacing.md,
        color: colors.text,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    surface: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 44 + spacing.lg + spacing.md,
        backgroundColor: colors.border,
    },
}));
