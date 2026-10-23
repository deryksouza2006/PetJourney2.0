import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';

export interface ThemeColors {
    background: string;
    surface: string;
    card: string;
    inputBackground: string;
    primary: string;
    primaryDark: string;
    primarySoft: string;
    primaryAction: string;
    primaryActionPressed: string;
    text: string;
    textSecondary: string;
    border: string;
    danger: string;
    success: string;
    warning: string;
    warningText: string;
    onPrimary: string;
    headerBackground: string;
    headerText: string;
    headerAccent: string;
    headerTextSecondary: string;
    headerControlBackground: string;
    headerControlBorder: string;
    overlayLight: string;
    errorSurface: string;
    errorBorder: string;
    successSurface: string;
    warningSurface: string;
}

export const lightThemeColors: ThemeColors = {
    background: '#F7F9FC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    inputBackground: '#FFFFFF',
    primary: '#2589D8',
    primaryDark: '#176FBA',
    primarySoft: '#EAF4FC',
    primaryAction: '#2589D8',
    primaryActionPressed: '#176FBA',
    text: '#172127',
    textSecondary: '#687480',
    border: '#DEE5EC',
    danger: '#C43D3D',
    success: '#2E8B57',
    warning: '#A66A00',
    warningText: '#8A5A00',
    onPrimary: '#FFFFFF',
    headerBackground: '#F7F9FC',
    headerText: '#172127',
    headerAccent: '#176FBA',
    headerTextSecondary: '#687480',
    headerControlBackground: '#EAF4FC',
    headerControlBorder: '#DEE5EC',
    overlayLight: 'rgba(255, 255, 255, 0.14)',
    errorSurface: '#FDF0F0',
    errorBorder: '#F1C6C6',
    successSurface: '#EAF7F0',
    warningSurface: '#FFF4D6',
};

export const darkThemeColors: ThemeColors = {
    background: '#0F151A',
    surface: '#182128',
    card: '#182128',
    inputBackground: '#111A20',
    primary: '#58A9E8',
    primaryDark: '#8FC9F4',
    primarySoft: '#17354A',
    primaryAction: '#176FBA',
    primaryActionPressed: '#125B99',
    text: '#F2F6F8',
    textSecondary: '#A9B5BE',
    border: '#34424C',
    danger: '#FF8585',
    success: '#63CE91',
    warning: '#F2C15C',
    warningText: '#F2C15C',
    onPrimary: '#FFFFFF',
    headerBackground: '#0B1115',
    headerText: '#FFFFFF',
    headerAccent: '#8FC9F4',
    headerTextSecondary: '#C7D0D7',
    headerControlBackground: 'rgba(255, 255, 255, 0.14)',
    headerControlBorder: 'rgba(255, 255, 255, 0.14)',
    overlayLight: 'rgba(255, 255, 255, 0.14)',
    errorSurface: '#3A2024',
    errorBorder: '#754148',
    successSurface: '#17352A',
    warningSurface: '#3B3018',
};

let activeThemeColors = lightThemeColors;

export function setActiveThemeColors(themeColors: ThemeColors): void {
    activeThemeColors = themeColors;
}

export const colors = new Proxy({} as ThemeColors, {
    get: (_target, property: keyof ThemeColors) => activeThemeColors[property],
});

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function createThemedStyles<T extends NamedStyles>(
    factory: (themeColors: ThemeColors) => T,
): T {
    let cachedColors: ThemeColors | null = null;
    let cachedStyles: T | null = null;

    return new Proxy({} as T, {
        get: (_target, property: string | symbol) => {
            if (cachedColors !== activeThemeColors || cachedStyles === null) {
                cachedColors = activeThemeColors;
                cachedStyles = StyleSheet.create(factory(activeThemeColors)) as T;
            }

            return cachedStyles[property as keyof T];
        },
    });
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40 } as const;

export const radii = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

export const typography = {
    display: 32,
    title: 26,
    heading: 20,
    body: 16,
    caption: 14,
    small: 12,
} as const;

export const shadows = {
    card: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 2,
    },
} as const;
