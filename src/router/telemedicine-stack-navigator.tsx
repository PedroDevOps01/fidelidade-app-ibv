import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import UserTelemedScreen from '../pages/user-telemed-sceen';
import UserTelemedMeetScreen from '../pages/user-telemed-meet-screen';
import UserTelemedQueueScreen from '../pages/user-telemed-sceen/user-telemed-queue-screen';
import UserTelemedFinished from '../pages/user-telemed-sceen/user-telemed-finished';
import AuthenticationStackNavigator from './authentication-stack-navigator';

const TelemedcineStack = createNativeStackNavigator();

export const TelemedcineStackNavigator = () => {
  const { colors } = useTheme();
  return (
    <TelemedcineStack.Navigator
      initialRouteName="user-telemed-screen"
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.onSurface,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerBackTitle: 'Voltar',
      }}>

        
      <TelemedcineStack.Screen name="user-login-screen-telemed" options={{ headerShown: false, headerTitle: 'Login' }}>
        {props => <AuthenticationStackNavigator {...props} initialRouteName="user-login-screen" routeAfterLogin="user-telemed-queue-screen" />}
      </TelemedcineStack.Screen>

      <TelemedcineStack.Screen
        name="user-telemed-screen"
        component={UserTelemedScreen}
        options={{
          headerShown: false,
          title: 'Telemedicina',
        }}
      />

      <TelemedcineStack.Screen
        name="user-telemed-queue-screen"
        component={UserTelemedQueueScreen}
        options={{
          headerShown: false,
          title: 'Atendimento',
        }}
      />

      {/** esta tela deve ser a tela de atendimento. outras telas virao antes desta */}
      <TelemedcineStack.Screen
        name="user-telemed-meet-screen"
        component={UserTelemedMeetScreen}
        options={{
          headerShown: false,
          title: 'Telemedicina',
          headerStyle: {
            backgroundColor: '#141414',
          },
        }}
      />

      <TelemedcineStack.Screen
        name="user-telemed-finished"
        component={UserTelemedFinished}
        options={{
          headerShown: false,
          title: 'Telemedicina',
          headerStyle: {
            backgroundColor: '#141414',
          },
        }}
      />
    </TelemedcineStack.Navigator>
  );
};
