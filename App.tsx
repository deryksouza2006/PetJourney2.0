import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationObserver } from './src/components/NotificationObserver';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

function AppContent() {
  const { isDark } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <NotificationObserver />
            <RootNavigator />
        </AuthProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    </SafeAreaProvider>
  );
}
