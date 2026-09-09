import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { BrandMark } from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';
import { AuthNavigator } from './AuthNavigator';
import { ClinicAdminNavigator } from './ClinicAdminNavigator';
import { SystemAdminNavigator } from './SystemAdminNavigator';
import { VeterinarianNavigator } from './VeterinarianNavigator';

export function RootNavigator() {
    const {
        user,
        isLoading,
        hasSessionRestoreError,
        retrySessionRestore,
        signOut,
    } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (hasSessionRestoreError) {
        return (
            <SafeAreaView style={styles.restoreSafeArea}>
                <ScrollView
                    style={styles.restoreScroll}
                    contentContainerStyle={styles.restoreContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.restoreLayout}>
                        <View style={styles.brandContainer}>
                            <BrandMark />
                        </View>

                        <View style={styles.restoreCard}>
                            <Text style={styles.eyebrow}>SESSÃO</Text>
                            <Text style={styles.restoreTitle}>Não foi possível validar sua sessão</Text>
                            <Text style={styles.restoreMessage} accessibilityLiveRegion="polite">
                                Verifique sua conexão ou a disponibilidade da API e tente novamente. Seus dados de
                                acesso foram preservados.
                            </Text>
                            <AppButton
                                label="Tentar novamente"
                                onPress={retrySessionRestore}
                                style={styles.restorePrimaryButton}
                            />
                            <AppButton
                                label="Sair da conta"
                                onPress={() => void signOut()}
                                variant="secondary"
                                style={styles.restoreSecondaryButton}
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    function renderNavigator() {
        if (!user) {
            return <AuthNavigator />;
        }

        switch (user.role) {
            case 'ADMIN_SISTEMA':
                return <SystemAdminNavigator />;
            case 'ADMIN_CLINICA':
                return <ClinicAdminNavigator />;
            case 'VETERINARIO':
                return <VeterinarianNavigator />;
            case 'TUTOR':
                return (
                    <SafeAreaView style={styles.tutorSafeArea}>
                        <ScrollView
                            style={styles.tutorScroll}
                            contentContainerStyle={styles.tutorContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.tutorLayout}>
                                <View style={styles.brandContainer}>
                                    <BrandMark />
                                </View>

                                <View style={styles.tutorCard}>
                                    <Text style={styles.eyebrow}>ÁREA DO TUTOR</Text>
                                    <Text style={styles.tutorTitle}>Sua área está sendo preparada</Text>
                                    <Text style={styles.tutorMessage}>
                                        O módulo do Tutor está previsto para a próxima Sprint. No momento,
                                        esta área ainda não possui funcionalidades disponíveis.
                                    </Text>
                                    <AppButton
                                        label="Sair da conta"
                                        onPress={() => void signOut()}
                                        style={styles.signOutButton}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                );
        }
    }

    return (
        <NavigationContainer>
            {renderNavigator()}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: colors.background,
    },
    restoreSafeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    restoreScroll: {
        flex: 1,
    },
    restoreContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxl,
    },
    restoreLayout: {
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
    },
    restoreCard: {
        alignItems: 'center',
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    restoreTitle: {
        color: colors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    restoreMessage: {
        marginTop: spacing.md,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 24,
        textAlign: 'center',
    },
    restorePrimaryButton: {
        width: '100%',
        marginTop: spacing.xl,
    },
    restoreSecondaryButton: {
        width: '100%',
        marginTop: spacing.md,
    },
    tutorSafeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    tutorScroll: {
        flex: 1,
    },
    tutorContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxl,
    },
    tutorLayout: {
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    tutorCard: {
        alignItems: 'center',
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    eyebrow: {
        marginBottom: spacing.sm,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.4,
        textAlign: 'center',
    },
    tutorTitle: {
        color: colors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    tutorMessage: {
        marginTop: spacing.md,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 24,
        textAlign: 'center',
    },
    signOutButton: {
        width: '100%',
        marginTop: spacing.xl,
    },
});
