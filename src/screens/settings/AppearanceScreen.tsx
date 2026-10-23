import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { createThemedStyles, radii, shadows, spacing, typography } from '../../theme/tokens';
import { ThemePreference } from '../../types/theme';

interface ThemeOption {
    value: ThemePreference;
    label: string;
    description: string;
}

const OPTIONS: ThemeOption[] = [
    {
        value: 'system',
        label: 'Usar tema do sistema',
        description: 'Acompanha automaticamente a aparência do dispositivo.',
    },
    {
        value: 'light',
        label: 'Claro',
        description: 'Mantém o aplicativo com o tema claro.',
    },
    {
        value: 'dark',
        label: 'Escuro',
        description: 'Mantém o aplicativo com o tema escuro.',
    },
];

export function AppearanceScreen() {
    const { themePreference, resolvedTheme, setThemePreference } = useTheme();

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>CONFIGURAÇÕES</Text>
                    <Text style={styles.title}>Aparência</Text>
                    <Text style={styles.description}>
                        Escolha como o PetJourney deve ser exibido neste dispositivo.
                    </Text>

                    <View style={styles.card}>
                        {OPTIONS.map((option) => {
                            const isSelected = themePreference === option.value;

                            return (
                                <Pressable
                                    key={option.value}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected: isSelected }}
                                    style={({ pressed }) => [
                                        styles.option,
                                        isSelected && styles.optionSelected,
                                        pressed && styles.optionPressed,
                                    ]}
                                    onPress={() => void setThemePreference(option.value)}
                                >
                                    <View style={[
                                        styles.radio,
                                        isSelected && styles.radioSelected,
                                    ]}>
                                        {isSelected ? <View style={styles.radioDot} /> : null}
                                    </View>
                                    <View style={styles.optionCopy}>
                                        <Text style={[
                                            styles.optionLabel,
                                            isSelected && styles.optionLabelSelected,
                                        ]}>
                                            {option.label}
                                        </Text>
                                        <Text style={styles.optionDescription}>
                                            {option.description}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Text style={styles.currentTheme}>
                        Tema aplicado: {resolvedTheme === 'dark' ? 'Escuro' : 'Claro'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = createThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: spacing.xl },
    wrapper: { width: '100%', maxWidth: 640, alignSelf: 'center' },
    eyebrow: {
        marginBottom: spacing.sm,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.4,
    },
    title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
    description: {
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 23,
    },
    card: {
        gap: spacing.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    option: {
        minHeight: 84,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.inputBackground,
    },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    optionPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
    radio: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radii.pill,
    },
    radioSelected: { borderColor: colors.primary },
    radioDot: { width: 10, height: 10, borderRadius: radii.pill, backgroundColor: colors.primary },
    optionCopy: { flex: 1, marginLeft: spacing.lg },
    optionLabel: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    optionLabelSelected: { color: colors.primaryDark },
    optionDescription: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    currentTheme: {
        marginTop: spacing.lg,
        color: colors.textSecondary,
        fontSize: typography.caption,
        textAlign: 'center',
    },
}));
