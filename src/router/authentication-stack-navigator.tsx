import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import LoginCheckCpf from '../pages/login-check-cpf';
import React from 'react';

const AuthenticationStack = createNativeStackNavigator();

interface AuthenticationStackNavigatorProps {
  initialRouteName: string;
  routeAfterLogin: string;
}

const AuthenticationStackNavigator: React.FC<AuthenticationStackNavigatorProps> = ({ initialRouteName, routeAfterLogin }) => {
  const { colors } = useTheme();
  return (
    <AuthenticationStack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.onSurface,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerBackTitle: 'Voltar',
      }}>
      <AuthenticationStack.Screen name="user-login-screen" options={{headerShown: false}}>
        {props => <LoginCheckCpf {...props}  routeAfterLogin={routeAfterLogin} />}
      </AuthenticationStack.Screen>
    </AuthenticationStack.Navigator>
  );
};

export default AuthenticationStackNavigator;
