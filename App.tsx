import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationObserver } from './src/components/NotificationObserver';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <StatusBar style="dark" />
                    <NotificationObserver />
                    <RootNavigator />
                </AuthProvider>
            </QueryClientProvider>
        </SafeAreaProvider>
  );
}
