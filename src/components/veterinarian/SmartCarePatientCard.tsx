import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';
import {
    SmartCareInsufficientDataPet,
    SmartCareRankingItem,
} from '../../types/smartCare';
import { SmartCarePriorityBadge } from './SmartCarePriorityBadge';

type SmartCarePatientCardProps = {
    kind: 'analysis';
    item: SmartCareRankingItem;
    onPress: () => void;
} | {
    kind: 'insufficient';
    item: SmartCareInsufficientDataPet;
};

export function SmartCarePatientCard(props: SmartCarePatientCardProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { item } = props;

    const content = (
        <>
            <View style={styles.avatar}>
                <Ionicons name="paw" size={23} color={colors.primary} />
            </View>

            <View style={styles.mainCopy}>
                <View style={styles.nameLine}>
                    <Text style={styles.petName} numberOfLines={2}>{item.petName}</Text>
                    <SmartCarePriorityBadge
                        priority={props.kind === 'analysis' ? props.item.prioridade : 'SEM_DADOS'}
                    />
                </View>
                <Text style={styles.reason} numberOfLines={3}>
                    {props.kind === 'analysis'
                        ? props.item.motivos[0] ?? 'Nenhum fator de atenção identificado.'
                        : 'Histórico clínico insuficiente para análise.'}
                </Text>
            </View>

            {props.kind === 'analysis' ? (
                <View style={styles.scoreBlock}>
                    <Text style={styles.score}>{props.item.score}</Text>
                    <Text style={styles.scoreLabel}>SCORE</Text>
                    <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={colors.textSecondary}
                        style={styles.chevron}
                    />
                </View>
            ) : null}
        </>
    );

    if (props.kind === 'insufficient') {
        return <View style={styles.card}>{content}</View>;
    }

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver análise SmartCare de ${item.petName}, score ${props.item.score}`}
            onPress={props.onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            {content}
        </Pressable>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        card: {
            minHeight: 104,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
            ...shadows.card,
        },
        pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
        avatar: {
            width: 48,
            height: 48,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        mainCopy: { flex: 1, minWidth: 0 },
        nameLine: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: spacing.sm,
        },
        petName: {
            maxWidth: '100%',
            color: colors.text,
            fontSize: typography.body,
            fontWeight: '800',
        },
        reason: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 19,
        },
        scoreBlock: {
            minWidth: 54,
            flexShrink: 0,
            alignItems: 'flex-end',
        },
        score: { color: colors.primary, fontSize: 29, fontWeight: '900', lineHeight: 32 },
        scoreLabel: {
            color: colors.textSecondary,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 0.9,
        },
        chevron: { marginTop: spacing.xs },
    });
}
