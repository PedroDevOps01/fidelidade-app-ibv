import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import UserTelemedMeetScreen from '../pages/user-telemed-meet-screen';
import UserTelepetScreen from '../pages/user-telepet-sceen';
import UserTelemedFinished from '../pages/user-telemed-sceen/user-telemed-finished';
import UserTelepetQueueScreen from '../pages/user-telepet-sceen/user-telepet-queue-screen';
import AuthenticationStackNavigator from './authentication-stack-navigator';

const TelepetStack = createNativeStackNavigator();

const TelepetStackNavigator = () => {
  const { colors } = useTheme();
  return (
    <TelepetStack.Navigator
      initialRouteName="user-telepet-screen"
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.onSurface,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerBackTitle: 'Voltar',
      }}>
      <TelepetStack.Screen name="user-login-screen-telepet" options={{ headerShown: false, headerTitle: 'Login' }}>
        {props => <AuthenticationStackNavigator {...props} initialRouteName="user-login-screen" routeAfterLogin="user-telepet-queue-screen" />}
      </TelepetStack.Screen>

      <TelepetStack.Screen
        name="user-telepet-screen"
        component={UserTelepetScreen}
        options={{
          headerShown: false,
          title: 'Telemedicina',
        }}
      />

      <TelepetStack.Screen
        name="user-telepet-queue-screen"
        component={UserTelepetQueueScreen}
        options={{
          headerShown: false,
          title: 'Atendimento',
        }}
      />

      {/** esta tela deve ser a tela de atendimento. outras telas virao antes desta */}
      <TelepetStack.Screen
        name="user-telepet-meet-screen"
        component={UserTelemedMeetScreen}
        options={{
          headerShown: false,
          title: 'Telemedicina',
          headerTintColor: '#fff',
          headerStyle: {
            backgroundColor: '#141414',
          },
        }}
      />

      <TelepetStack.Screen
        name="user-telepet-finished"
        component={UserTelemedFinished}
        options={{
          headerShown: false,
          title: 'Telemedicina',
          headerStyle: {
            backgroundColor: '#141414',
          },
        }}
      />
    </TelepetStack.Navigator>
  );
};

export default TelepetStackNavigator;
