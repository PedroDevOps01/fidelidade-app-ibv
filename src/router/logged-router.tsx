import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoggedHome from '../pages/logged-home';
import PartnersScreen from '../pages/user-create-credit-card/partners-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { useDadosUsuario } from '../context/pessoa-dados-context';
import { Platform } from 'react-native';
import { useUserCart } from '../context/user-cart-context';
import { useExames } from '../context/exames-context';
import SchedulesStackNavigator from './schedules-stack-navigator';
import ProfileStackNavigator from './profile-stack-navigator';
import { MdvStackNavigator } from './mdv-stack-navigator';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// Componente principal com a estrutura de navegação
const MainTabs = () => {
  const { colors } = useTheme();
  const { selectedExams } = useExames();

  return (
    <Tab.Navigator
      backBehavior="initialRoute"
      initialRouteName={'Home'}
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        headerTintColor: colors.onSurface,
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: 'transparent',
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0.3,
          borderTopColor: colors.onSurfaceVariant,
          height: Platform.OS === 'android' ? 60 : 90,
          elevation: 0,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'user-data':
              iconName = 'account';
              break;
            case 'user-mdv':
              iconName = 'currency-usd';
              break;
            case 'Shopping':
              iconName = 'shopping';
              break;
            case 'user-schedules':
              iconName = 'calendar';
              break;
            default:
              iconName = 'circle';
          }
          return <Icon name={iconName} size={30} color={color} />;
        },
        tabBarActiveTintColor: colors.onPrimary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarActiveBackgroundColor: colors.primary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingVertical: 5,
          borderRadius: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          padding: 0,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={LoggedHome}
        options={{
          tabBarLabel: 'Início',
          title: 'Bem Vindo!',
        }}
      />
      <Tab.Screen
        name="user-schedules"
        component={SchedulesStackNavigator}
        options={{
          tabBarLabel: 'Agendamentos',
          headerShown: false,
          headerShadowVisible: false,
          title: 'Meus Agendamentos',
          tabBarBadge: selectedExams.length > 0 ? selectedExams.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#4003ff',
            bottom: 20,
          },
        }}
      />
      <Tab.Screen
        name="user-data"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Perfil',
          headerShadowVisible: false,
          title: 'Meus Dados',
        }}
      />
      <Tab.Screen
        name="user-mdv"
        component={MdvStackNavigator}
        options={{
          tabBarLabel: 'Vendas',
          headerShadowVisible: false,
          title: 'Indique e ganhe',
        }}
      />
    </Tab.Navigator>
  );
};

// Navigator raiz que gerencia as telas modais/stack
const LoggedDrawerNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <RootStack.Screen
        name="MainTabs"
        component={MainTabs}
      />
      <RootStack.Screen
        name="ParceirosScreen"
        component={PartnersScreen}
        options={{ 
          presentation: 'modal', // ou 'card' se preferir
          title: 'Nossos Parceiros',
          headerShown: true,
          headerTintColor: colors.onSurface,
          headerStyle: {
            backgroundColor: colors.surface,
          },
        }}
      />
    </RootStack.Navigator>
  );
};

export default LoggedDrawerNavigator;