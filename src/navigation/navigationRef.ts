import { createNavigationContainerRef } from '@react-navigation/native';
import type { TutorStackParamList } from './TutorNavigator';

export const navigationRef = createNavigationContainerRef<TutorStackParamList>();

let tutorAgendaNavigationPending = false;

export function openTutorAgendaFromNotification(): void {
    if (navigationRef.isReady()) {
        navigationRef.navigate('TutorAgenda');
        tutorAgendaNavigationPending = false;
        return;
    }

    tutorAgendaNavigationPending = true;
}

export function flushPendingNotificationNavigation(): void {
    if (!tutorAgendaNavigationPending || !navigationRef.isReady()) {
        return;
    }

    navigationRef.navigate('TutorAgenda');
    tutorAgendaNavigationPending = false;
}
