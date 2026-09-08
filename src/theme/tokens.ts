export const colors = {
    background: '#F7F9FC',
    surface: '#FFFFFF',
    primary: '#2589D8',
    primaryDark: '#176FBA',
    primarySoft: '#EAF4FC',
    text: '#172127',
    textSecondary: '#687480',
    border: '#DEE5EC',
    danger: '#C43D3D',
    success: '#2E8B57',
    white: '#FFFFFF',
    overlayLight: 'rgba(255, 255, 255, 0.14)',
} as const;

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
        shadowColor: '#172127',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 2,
    },
} as const;
