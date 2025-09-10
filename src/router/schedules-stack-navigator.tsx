import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import UserSchedulesScreen from '../pages/user-schedules-screen';
import UserConsultasScreen from '../pages/user-consultas-screen';
import UserProcedureDetailsScreen from '../pages/user-procedure-details-screen';
import UserProcedureTime from '../pages/user-procedure-time';
import UserProceduresByMedico from '../pages/user-procedures-by-medico';
import UserSelectPaymentMethod from '../pages/user-select-payment-method';
import UserPaymentScheduleScreen from '../pages/user-payment-schedule-screen';
import UserPaymentCreditCardScheduleScreen from '../pages/user-payment-creditcard-schedule-screen';
import UserPaymentSuccessfull from '../pages/user-payment-successfull';
import UserExamsCheckLocal from '../pages/user-exams-check-local';
import UserExamsSelectDate from '../pages/user-exams-select-date';
import UserSchedulesHistoryScreen from '../pages/user-schedules-history-screen';
import UserCreateCreditCard from '../pages/user-create-credit-card';
import AuthenticationStackNavigator from './authentication-stack-navigator';
import UserContractPaymentFailed from '../pages/user-payment-failed';

const SchedulesStack = createNativeStackNavigator();

const SchedulesStackNavigator = () => {
  const { colors } = useTheme();
  return (
    <SchedulesStack.Navigator
      initialRouteName="user-schedules-screen"
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.onPrimaryContainer,
        headerStyle: {
          backgroundColor: colors.primaryContainer,
        },
        headerShadowVisible: false,
        headerBackTitle: 'Voltar',
        headerTitleAlign: 'center',
      }}>
      <SchedulesStack.Screen
        name="user-schedules-screen"
        component={UserSchedulesScreen}
        options={{
          headerShown: true,
          title: 'Agendamentos',
          headerTitleAlign: 'center',
          headerShadowVisible: false,

          headerStyle: {
            backgroundColor: colors.primaryContainer,
          },
          headerTintColor: colors.onPrimaryContainer,
        }}
      />

      <SchedulesStack.Screen name="user-login-screen-exams" options={{ headerShown: false, headerTitle: 'Login' }}>
        {props => <AuthenticationStackNavigator {...props} initialRouteName="user-login-screen" routeAfterLogin="user-select-payment-method" />}
      </SchedulesStack.Screen>

      <SchedulesStack.Screen
        name="user-consultas-screen-list"
        component={UserConsultasScreen}
        options={{
          headerShown: true,
          title: 'Consultas',
          headerShadowVisible: false,
          headerTitleAlign: 'center',

          headerStyle: {
            backgroundColor: colors.primaryContainer,
          },
          headerTintColor: colors.onPrimaryContainer,
        }}
      />
      <SchedulesStack.Screen
        name="user-procedure-details-screen"
        component={UserProcedureDetailsScreen}
        options={{
          headerTitleAlign: 'center',

          headerShown: true,
          title: 'Detalhes do Procedimento',
          headerStyle: {
            backgroundColor: colors.primaryContainer,
          },
          headerTintColor: colors.onPrimaryContainer,
        }}
      />
      <SchedulesStack.Screen
        name="user-procedure-time"
        component={UserProcedureTime}
        options={{
          headerTitleAlign: 'center',

          headerShown: true,
          title: 'Horários',
          headerStyle: {
            backgroundColor: colors.primaryContainer,
          },
          headerTintColor: colors.onPrimaryContainer,
        }}
      />

      <SchedulesStack.Screen
        name="user-procedures-by-medico"
        component={UserProceduresByMedico}
        options={{
          headerTitleAlign: 'center',

          headerShown: true,
          title: 'Consultas',
          headerStyle: {
            backgroundColor: colors.primaryContainer,
          },
          headerTintColor: colors.onPrimaryContainer,
        }}
      />

      <SchedulesStack.Screen
        name="user-select-payment-method"
        component={UserSelectPaymentMethod}
        options={{
          headerTitleAlign: 'center',

          headerShown: true,
          title: 'Forma de pagamento',
          headerStyle: {
            backgroundColor: colors.primaryContainer,
          },
          headerTintColor: colors.onPrimaryContainer,
        }}
      />
      <SchedulesStack.Screen
        name="user-payment-pix-schedule-screen"
        component={UserPaymentScheduleScreen}
        options={{
          headerTitleAlign: 'center',

          headerShown: true,
          title: 'Pagamento',
          headerStyle: {
            backgroundColor: colors.primaryContainer,
          },
          headerTintColor: colors.onPrimaryContainer,
        }}
      />

      <SchedulesStack.Screen
        name="user-payment-creditcard-schedule-screen"
        component={UserPaymentCreditCardScheduleScreen}
        options={{
          headerTitleAlign: 'center',

          headerShown: true,
          title: 'Pagamento',
          headerStyle: {
            backgroundColor: colors.primaryContainer,
          },
          headerTintColor: colors.onPrimaryContainer,
        }}
      />

      <SchedulesStack.Screen name="user-payment-successfull-screen" component={UserPaymentSuccessfull}  options={{ headerShown: false }}/>
      <SchedulesStack.Screen name="user-exams-check-local-screen" component={UserExamsCheckLocal} options={{ headerShown: true, title: 'Locais disponíveis' }} />
      <SchedulesStack.Screen name="user-exams-select-date" component={UserExamsSelectDate} options={{ headerShown: true, title: 'Datas disponíveis' }} />
      <SchedulesStack.Screen name="user-shcdules-history-screen" component={UserSchedulesHistoryScreen} options={{ headerShown: true, title: 'Agendamentos' }} />
      <SchedulesStack.Screen name="user-create-credit-card-screen" component={UserCreateCreditCard} options={{ headerShown: true, title: 'Cadastrar Cartão' }} />
      <SchedulesStack.Screen name="user-payment-failed-screen" component={UserContractPaymentFailed} />
    </SchedulesStack.Navigator>
  );
};

export default SchedulesStackNavigator;
