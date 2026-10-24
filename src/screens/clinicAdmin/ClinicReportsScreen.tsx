import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicManagementRow } from '../../components/clinicAdmin/ClinicManagementRow';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { createThemedStyles, radii, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<ClinicAdminStackParamList, 'ClinicReports'>;

export function ClinicReportsScreen({ navigation }: Props) {
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
                    <Text style={styles.eyebrow}>RELATÓRIOS</Text>
                    <Text style={styles.title}>Relatórios da Clínica</Text>
                    <Text style={styles.description}>
                        Consulte os relatórios processados pelo sistema.
                    </Text>

                    <View style={styles.surface}>
                        <ClinicManagementRow
                            icon="paw-outline"
                            title="Relatório de Pets"
                            description="Pets e tutores vinculados à clínica"
                            onPress={() => navigation.navigate('ClinicPetReport')}
                        />
                        <View style={styles.divider} />
                        <ClinicManagementRow
                            icon="scale-outline"
                            title="Relatório de Peso"
                            description="Peso consolidado por espécie e sexo"
                            onPress={() => navigation.navigate('ClinicPetWeightReport')}
                        />
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
    surface: {
        overflow: 'hidden',
        marginTop: spacing.xxl,
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
