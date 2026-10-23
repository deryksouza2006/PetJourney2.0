import * as SecureStore from 'expo-secure-store';
import { ThemePreference } from '../types/theme';

const THEME_PREFERENCE_KEY = 'petjourney_theme_preference';

function isThemePreference(value: string | null): value is ThemePreference {
    return value === 'system' || value === 'light' || value === 'dark';
}

export async function getThemePreference(): Promise<ThemePreference> {
    const preference = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);

    return isThemePreference(preference) ? preference : 'system';
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
    await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, preference);
}
