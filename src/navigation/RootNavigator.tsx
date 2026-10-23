import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { BrandMark } from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { colors, createThemedStyles, radii, shadows, spacing, typography } from '../theme/tokens';
import { AuthNavigator } from './AuthNavigator';
import { ClinicAdminNavigator } from './ClinicAdminNavigator';
import { SystemAdminNavigator } from './SystemAdminNavigator';
import { TutorNavigator } from './TutorNavigator';
import { VeterinarianNavigator } from './VeterinarianNavigator';
import {
    flushPendingNotificationNavigation,
    navigationRef,
} from './navigationRef';

export function RootNavigator() {
    const { colors: themeColors, isDark } = useTheme();
    const navigationTheme = useMemo(() => {
        const baseTheme = isDark ? DarkTheme : DefaultTheme;

        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                primary: themeColors.primary,
                background: themeColors.background,
                card: themeColors.surface,
                text: themeColors.text,
                border: themeColors.border,
                notification: themeColors.danger,
            },
        };
    }, [isDark, themeColors]);
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
                return <TutorNavigator />;
        }
    }

    return (
        <NavigationContainer
            ref={navigationRef}
            theme={navigationTheme}
            onReady={flushPendingNotificationNavigation}
        >
            {renderNavigator()}
        </NavigationContainer>
    );
}

const styles = createThemedStyles((colors) => ({
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
    brandContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    eyebrow: {
        marginBottom: spacing.sm,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.4,
        textAlign: 'center',
    },
}));
