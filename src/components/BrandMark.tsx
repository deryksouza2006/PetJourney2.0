import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

interface BrandMarkProps { compact?: boolean; light?: boolean; }

export function BrandMark({ compact = false, light = false }: BrandMarkProps) {
    return (
        <View style={styles.container}>
            <View style={[styles.symbol, compact && styles.symbolCompact]}>
                <Text style={[styles.symbolText, compact && styles.symbolTextCompact]}>PJ</Text>
            </View>
            <Text style={[styles.name, compact && styles.nameCompact, light && styles.nameLight]}>
                PetJourney
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    symbol: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.primary,
    },
    symbolCompact: { width: 36, height: 36, borderRadius: radii.sm },
    symbolText: { color: colors.white, fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
    symbolTextCompact: { fontSize: 12 },
    name: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    nameCompact: { fontSize: 19 },
    nameLight: { color: colors.white },
});
