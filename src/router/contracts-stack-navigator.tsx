import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ContratosScreen from '../pages/contratos-screen';
import NewContratoScreen from '../pages/new-contrato-screen';
import ContratoParcelaDetailScren from '../pages/contrato-parcela-detail-screen';
import UserPaymentScreen from '../pages/user-payment-screen';
import UserPaymentCreditCardScreen from '../pages/user-payment-creditcard-screen';
import UserPaymentSuccessfull from '../pages/user-payment-successfull';
import UserPaymentSuccessfullParcela from '../pages/user-payment-successfull-parcela';

import UserPaymentContractResumeScreen from '../pages/user-payment-contract-resume-screen';
import UserCreateCreditCard from '../pages/user-create-credit-card';
import UserPaymentAttemptScreen from '../pages/user-payment-attempt-screen';
import UserDependentsScreen from '../pages/user-dependents-screen';
import { useTheme } from 'react-native-paper';
import { PessoaCreateProvider } from '../context/create-pessoa-context';

const ContractsStack = createNativeStackNavigator();

const ContractsStackNavigator = () => {
  const { colors } = useTheme();
  return (
    <PessoaCreateProvider>
      <ContractsStack.Navigator
        initialRouteName="user-contratos-screen"
        screenOptions={{
          headerShown: false,
          headerTintColor: colors.onSurface,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerBackTitle: 'Voltar',
        }}>
        <ContractsStack.Screen
          name="user-contratos-screen"
          component={ContratosScreen}
          options={{
            headerShown: false,
            title: 'Meus Dados',
            
          }}
        />
        <ContractsStack.Screen
          name="new-contrato-screen"
          component={NewContratoScreen}
          options={{
            headerShown: false,
            title: 'Novo contrato',
          }}
        />
        <ContractsStack.Screen
          name="contrato-parcela-details"
          component={ContratoParcelaDetailScren}
          options={{
            headerShown: false,
            title: 'Meus Dados',
          }}
        />
        <ContractsStack.Screen
          name="user-dependents-screen"
          component={UserDependentsScreen}
          options={{
            headerShown: false,
            title: 'Dependentes',
          }}
        />
        <ContractsStack.Screen name="user-payment-screen" component={UserPaymentScreen} />
        <ContractsStack.Screen name="user-payment-creditcard-screen" component={UserPaymentCreditCardScreen} />
        <ContractsStack.Screen name="user-payment-successfull-screen" component={UserPaymentSuccessfullParcela}  options={{ headerShown: false }}/>
        <ContractsStack.Screen name="user-contratos-payment-resume-screen" component={UserPaymentContractResumeScreen} />
        {/* <ContractsStack.Screen name="contrato-details" component={ContratosDetailScreen} /> */}
        <ContractsStack.Screen name="user-create-credit-card-screen" component={UserCreateCreditCard} options={{ headerShown: true, title: '' }} />
        <ContractsStack.Screen name="user-payment-attempt-screen" component={UserPaymentAttemptScreen} options={{ headerShown: false, title: '' }} />
      
      
      
      
      </ContractsStack.Navigator>
    </PessoaCreateProvider>
  );
};

export default ContractsStackNavigator;
