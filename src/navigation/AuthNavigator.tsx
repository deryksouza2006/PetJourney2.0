import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FirstAccessScreen } from '../screens/auth/FirstAccessScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';

export type AuthStackParamList = {
    Login: undefined;
    FirstAccess: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="FirstAccess" component={FirstAccessScreen} />
        </Stack.Navigator>
    );
}
