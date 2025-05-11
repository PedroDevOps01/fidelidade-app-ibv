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

const SchedulesStack = createNativeStackNavigator();

const SchedulesStackNavigator = () => {
  const { colors } = useTheme();
  return (
    <SchedulesStack.Navigator
      initialRouteName="user-schedules-screen"
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.onSurface,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerBackTitle: 'Voltar',
      }}>
      <SchedulesStack.Screen
        name="user-schedules-screen"
        component={UserSchedulesScreen}
        options={{
          headerShown: true,
          title: 'Meus Agendamentos',
          headerShadowVisible: false,
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
        }}
      />
      <SchedulesStack.Screen
        name="user-procedure-details-screen"
        component={UserProcedureDetailsScreen}
        options={{
          headerShown: true,
          title: 'Detalhes do Procedimento',
        }}
      />
      <SchedulesStack.Screen
        name="user-procedure-time"
        component={UserProcedureTime}
        options={{
          headerShown: true,
          title: 'Horários',
        }}
      />

      <SchedulesStack.Screen
        name="user-procedures-by-medico"
        component={UserProceduresByMedico}
        options={{
          headerShown: true,
          title: 'Consultas',
        }}
      />

      <SchedulesStack.Screen
        name="user-select-payment-method"
        component={UserSelectPaymentMethod}
        options={{
          headerShown: true,
          title: 'Forma de pagamento',
        }}
      />
      <SchedulesStack.Screen
        name="user-payment-pix-schedule-screen"
        component={UserPaymentScheduleScreen}
        options={{
          headerShown: true,
          title: 'Pagamento',
        }}
      />

      <SchedulesStack.Screen
        name="user-payment-creditcard-schedule-screen"
        component={UserPaymentCreditCardScheduleScreen}
        options={{
          headerShown: true,
          title: 'Pagamento',
        }}
      />

      <SchedulesStack.Screen name="user-payment-successfull-screen" component={UserPaymentSuccessfull} />
      <SchedulesStack.Screen name="user-exams-check-local-screen" component={UserExamsCheckLocal} options={{ headerShown: true, title: 'Locais disponíveis' }} />
      <SchedulesStack.Screen name="user-exams-select-date" component={UserExamsSelectDate} options={{ headerShown: true, title: 'Datas disponíveis' }} />
      <SchedulesStack.Screen name="user-shcdules-history-screen" component={UserSchedulesHistoryScreen} options={{ headerShown: true, title: 'Meus agendamentos' }} />
      <SchedulesStack.Screen name="user-create-credit-card-screen" component={UserCreateCreditCard} options={{ headerShown: true, title: 'Cadastrar Cartão' }} />
    </SchedulesStack.Navigator>
  );
};

export default SchedulesStackNavigator;
