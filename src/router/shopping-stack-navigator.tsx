import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import UserProdutosScreen from '../pages/user-produtos-screen';
import ProdutoDetailsScreen from '../pages/user-produtos-screen/produto-details-screen';
import UserCartScreen from '../pages/user-cart-screen';
import AuthenticationStackNavigator from './authentication-stack-navigator';

const ShoppingStack = createNativeStackNavigator();

const ShoppingStackNavigator = () => {
  const { colors } = useTheme();
  return (
    <ShoppingStack.Navigator
      initialRouteName="user-produtos-screen"
      screenOptions={{
        headerTintColor: colors.onSurface,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
      }}>
      <ShoppingStack.Screen
        name="user-produtos-screen"
        component={UserProdutosScreen}
        options={{
          headerShown: true,
          title: 'Loja',
        }}
      />
      <ShoppingStack.Screen
        name="user-produtos-screen-details"
        component={ProdutoDetailsScreen}
        options={{
          headerShown: false,
          title: 'Detalhes',
        }}
      />
      <ShoppingStack.Screen name="user-cart-screen" component={UserCartScreen} options={{ headerShown: true, title: 'Meu Carrinho' }} />
    
      <ShoppingStack.Screen name="user-login-screen-shopping" options={{ headerShown: true, headerTitle: 'Login' }}>
        {props => <AuthenticationStackNavigator {...props} initialRouteName="user-login-screen" routeAfterLogin="user-cart-screen" />}
      </ShoppingStack.Screen>
               
    </ShoppingStack.Navigator>
  );
};

export default ShoppingStackNavigator;
