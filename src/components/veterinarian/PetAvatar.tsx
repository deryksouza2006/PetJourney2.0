import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, ThemeColors } from '../../theme/tokens';

interface PetAvatarProps {
    imageUri?: string | null;
    size?: number;
}

export function PetAvatar({ imageUri = null, size = 48 }: PetAvatarProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const dimensions = { width: size, height: size };

    return (
        <View style={[styles.avatar, dimensions]}>
            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    resizeMode="cover"
                    style={[styles.image, dimensions]}
                />
            ) : (
                <Ionicons name="paw" size={Math.round(size * 0.48)} color={colors.primary} />
            )}
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        avatar: {
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        image: { borderRadius: radii.pill },
    });
}
