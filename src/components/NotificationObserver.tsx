import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { openTutorAgendaFromNotification } from '../navigation/navigationRef';
import {
    getAppointmentNotificationData,
    initializeLocalNotifications,
} from '../services/notificationService';

export function NotificationObserver() {
    const { user, isLoading } = useAuth();

    useEffect(() => {
        void initializeLocalNotifications().catch(() => undefined);
    }, []);

    useEffect(() => {
        let isActive = true;

        async function handleResponse(
            response: Notifications.NotificationResponse | null,
        ): Promise<void> {
            if (
                !isActive
                || !response
                || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
                || !getAppointmentNotificationData(
                    response.notification.request.content.data,
                )
            ) {
                return;
            }

            if (isLoading || !user) {
                return;
            }

            if (user.role === 'TUTOR') {
                openTutorAgendaFromNotification();
            }

            await Notifications.clearLastNotificationResponseAsync();
        }

        void Notifications.getLastNotificationResponseAsync()
            .then(handleResponse)
            .catch(() => undefined);

        const subscription = Notifications.addNotificationResponseReceivedListener(
            (response) => void handleResponse(response),
        );

        return () => {
            isActive = false;
            subscription.remove();
        };
    }, [isLoading, user]);

    return null;
}
