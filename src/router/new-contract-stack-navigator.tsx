import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccquirePlanProvider } from '../context/accquirePlanContext';
import { useTheme } from 'react-native-paper';
import UserPaymentAttemptScreen from '../pages/user-payment-attempt-screen';
import ContractsPresenterScreen from '../pages/user-contracts-presenter-screen';
import UserContractsPaymentMethod from '../pages/user-contracts-payment-method';
import UserContractsPaymentMethodRouter from '../pages/user-contracts-payment-method-router';
import UserContractPaymentSuccessfull from '../pages/user-contracts-payment-successfull';
import AuthenticationStackNavigator from './authentication-stack-navigator';
import UserContractPaymentFailed from '../pages/user-payment-failed';

const NewContractStack = createNativeStackNavigator();

export const NewContractStackNavigator = () => {
  const { colors } = useTheme();
  return (
    <AccquirePlanProvider>
      <NewContractStack.Navigator
        initialRouteName="user-payment-attempt-screen"
        screenOptions={{
          headerShown: false,
          headerTintColor: colors.onSurface,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerBackTitle: 'Voltar',
        }}>
        <NewContractStack.Screen name="user-login-screen-new-contract" options={{ headerBackVisible: false, headerShown: true, headerTitle: 'Login' }}>
          {props => <AuthenticationStackNavigator {...props} initialRouteName="user-login-screen" routeAfterLogin="user-contracts-presenter-screen" />}
        </NewContractStack.Screen>
        <NewContractStack.Screen name="user-payment-attempt-screen" component={UserPaymentAttemptScreen} options={{ headerShown: false }} />
        <NewContractStack.Screen
          name="user-contracts-presenter-screen"
          component={ContractsPresenterScreen}
          options={{
            headerBackVisible: true,
            headerStyle: { backgroundColor: colors.primaryContainer },
            headerTintColor: colors.onPrimaryContainer,

            headerShown: true,
            title: 'Planos',
            headerTitleAlign: 'center', // <--- centraliza o título
          }}
        />
<NewContractStack.Screen
  name="user-contracts-payment-method"
  component={UserContractsPaymentMethod}
  options={{
    headerBackVisible: true,
    headerStyle: { backgroundColor: colors.primaryContainer },
    headerTintColor: colors.onPrimaryContainer,
    headerShown: true,
    title: 'Formas de Pagamento',
    headerTitleAlign: 'center',
  }}
/>
<NewContractStack.Screen
  name="user-contracts-payment-method-router"
  component={UserContractsPaymentMethodRouter}
  options={{
    headerBackVisible: true,
    headerStyle: { backgroundColor: colors.primaryContainer },
    headerTintColor: colors.onPrimaryContainer,
    headerShown: true,
    title: 'Pagamento',
    headerTitleAlign: 'center',
  }}
/>
<NewContractStack.Screen
  name="user-contracts-payment-successfull"
  component={UserContractPaymentSuccessfull}
  options={{
    headerBackVisible: true,
    headerStyle: { backgroundColor: colors.primaryContainer },
    headerTintColor: colors.onPrimaryContainer,
    headerShown: true,
    title: 'Pagamento',
    headerTitleAlign: 'center',
  }}
/>
<NewContractStack.Screen
  name="user-contracts-payment-failed"
  component={UserContractPaymentFailed}
  options={{
    headerBackVisible: true,
    headerStyle: { backgroundColor: colors.primaryContainer },
    headerTintColor: colors.onPrimaryContainer,
    headerShown: true,
    title: 'Pagamento',
    headerTitleAlign: 'center',
  }}
/>
      </NewContractStack.Navigator>
    </AccquirePlanProvider>
  );
};
