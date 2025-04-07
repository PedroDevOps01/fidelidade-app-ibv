import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import UserDataScreen from '../pages/user-data-screen';
import UserPersonalDataScreen from '../pages/user-data-screen/dados-pessoais';
import CreditCardStackNavigator from './credit-card-stack-navigator';
import AuthenticationStackNavigator from './authentication-stack-navigator';
import { useDadosUsuario } from '../context/pessoa-dados-context';

const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
  const { colors } = useTheme();
  const {dadosUsuarioData} = useDadosUsuario()
  const isLogged = !dadosUsuarioData.user.id_usuario_usr ? false : true
  return (
    <ProfileStack.Navigator
      initialRouteName={isLogged ? 'user-data-screen' : 'user-login-screen_profile' }
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerBackTitle: 'Voltar',
        headerTintColor: colors.onSurface,
      }}>
        
      <ProfileStack.Screen name="user-login-screen_profile" options={{ headerShown: false, headerTitle: 'Login' }}>
        {props => <AuthenticationStackNavigator {...props} initialRouteName="user-login-screen" routeAfterLogin="user-data-screen" />}
      </ProfileStack.Screen>

      <ProfileStack.Screen name="user-data-screen" component={UserDataScreen} options={{ headerShown: true, headerTitle: 'Login' }} />
      <ProfileStack.Screen name="user-personal-data-screen" component={UserPersonalDataScreen} options={{ headerTitle: 'Dados pessoais' }} />
      <ProfileStack.Screen name="user-personal-credit-cards-screen" component={CreditCardStackNavigator} options={{ headerTitle: 'Meus cartões de crédito' }} />
    </ProfileStack.Navigator>
  );
};

export default ProfileStackNavigator;
