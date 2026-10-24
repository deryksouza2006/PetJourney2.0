import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { SmartCareRankingItem } from '../../types/smartCare';
import { SmartCarePriorityBadge } from './SmartCarePriorityBadge';

interface SmartCareDetailsModalProps {
    analysis: SmartCareRankingItem | null;
    onClose: () => void;
}

export function SmartCareDetailsModal({ analysis, onClose }: SmartCareDetailsModalProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <Modal
            visible={analysis !== null}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom', 'left']}>
                {analysis ? (
                    <>
                        <View style={styles.header}>
                            <View style={styles.headerCopy}>
                                <Text style={styles.eyebrow}>ANÁLISE SMARTCARE</Text>
                                <Text style={styles.petName}>{analysis.petName}</Text>
                            </View>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Fechar detalhes SmartCare"
                                hitSlop={8}
                                onPress={onClose}
                                style={({ pressed }) => [
                                    styles.closeButton,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </Pressable>
                        </View>

                        <ScrollView
                            style={styles.scroll}
                            contentContainerStyle={styles.content}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.summaryCard}>
                                <View>
                                    <Text style={styles.summaryLabel}>SCORE</Text>
                                    <View style={styles.scoreLine}>
                                        <Text style={styles.score}>{analysis.score}</Text>
                                        <Text style={styles.scoreTotal}>/ 100</Text>
                                    </View>
                                </View>
                                <View style={styles.prioritySummary}>
                                    <Text style={styles.summaryLabel}>PRIORIDADE</Text>
                                    <SmartCarePriorityBadge priority={analysis.prioridade} />
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Por que requer atenção?</Text>
                                {analysis.motivos.length > 0 ? (
                                    analysis.motivos.map((reason, index) => (
                                        <View key={`${reason}-${index}`} style={styles.reasonRow}>
                                            <View style={styles.reasonIcon}>
                                                <Ionicons
                                                    name="alert-circle-outline"
                                                    size={18}
                                                    color={colors.primary}
                                                />
                                            </View>
                                            <Text style={styles.reasonText}>{reason}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.bodyText}>
                                        Nenhum fator de atenção identificado.
                                    </Text>
                                )}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Recomendação</Text>
                                <View style={styles.recommendationCard}>
                                    <Ionicons
                                        name="medical-outline"
                                        size={21}
                                        color={colors.primary}
                                    />
                                    <Text style={styles.recommendationText}>
                                        {analysis.recomendacao || 'Nenhuma recomendação informada.'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.disclaimer}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                                <Text style={styles.disclaimerText}>
                                    SmartCare auxilia a decisão clínica e não substitui a avaliação veterinária.
                                </Text>
                            </View>
                        </ScrollView>
                    </>
                ) : null}
            </SafeAreaView>
        </Modal>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.lg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
        },
        headerCopy: { flex: 1, minWidth: 0 },
        eyebrow: {
            marginBottom: spacing.xs,
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.1,
        },
        petName: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
        closeButton: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.pill,
            backgroundColor: colors.inputBackground,
        },
        pressed: { opacity: 0.72 },
        scroll: { flex: 1 },
        content: {
            width: '100%',
            maxWidth: 720,
            alignSelf: 'center',
            padding: spacing.xl,
            paddingBottom: spacing.xxxl,
        },
        summaryCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.xl,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        summaryLabel: {
            marginBottom: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 0.8,
        },
        scoreLine: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
        score: { color: colors.primary, fontSize: 42, fontWeight: '900', lineHeight: 48 },
        scoreTotal: { color: colors.textSecondary, fontSize: typography.body, fontWeight: '700' },
        prioritySummary: { alignItems: 'flex-end' },
        section: { marginTop: spacing.xxl },
        sectionTitle: {
            marginBottom: spacing.lg,
            color: colors.text,
            fontSize: typography.heading,
            fontWeight: '800',
        },
        reasonRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.md,
            marginBottom: spacing.md,
        },
        reasonIcon: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        reasonText: {
            flex: 1,
            paddingTop: 6,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 21,
        },
        bodyText: { color: colors.textSecondary, fontSize: typography.caption, lineHeight: 21 },
        recommendationCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.primarySoft,
        },
        recommendationText: {
            flex: 1,
            color: colors.text,
            fontSize: typography.caption,
            lineHeight: 22,
        },
        disclaimer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
            marginTop: spacing.xxl,
            padding: spacing.md,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
        },
        disclaimerText: {
            flex: 1,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
    });
}
