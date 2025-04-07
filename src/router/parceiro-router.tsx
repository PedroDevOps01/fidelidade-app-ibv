import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { useDadosUsuario } from '../context/pessoa-dados-context';
import ParceiroHomeScreen from '../pages/parceiro-home-screen';
import ParceirosProdutosScreen from '../pages/parceiro-produtos-screen';
import ParceiroDataScreen from '../pages/parceiro-data-screen';
import { Platform } from 'react-native';
import { useUserCart } from '../context/user-cart-context';
import { useExames } from '../context/exames-context';

const Tab = createBottomTabNavigator();

const ParceiroLoggedDrawerNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      backBehavior="initialRoute"
      initialRouteName={'dashboard'}
      screenOptions={({ route }) => ({
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
          height: Platform.OS == 'android' ? 60 : 90,
          elevation: 0, // Remove sombra
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'dashboard':
              iconName = 'storefront';
              break;
            case 'ParceiroProdutosScreen':
              iconName = 'tag-multiple';
              break;
            case 'ParceiroDataScreen':
              iconName = 'clipboard-account';
              break;
            case 'user-schedules':
              iconName = 'calendar';
              break;
            default:
              iconName = 'circle';
          }
          return <Icon name={iconName} size={size || 24} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      })}>
      <Tab.Screen
        name="ParceiroProdutosScreen"
        component={ParceirosProdutosScreen}
        options={{
          tabBarLabel: 'Produtos',
          title: 'Meus Produtos',
        }}
      />

      <Tab.Screen
        name="dashboard"
        component={ParceiroHomeScreen}
        options={{
          tabBarLabel: 'Dashboard',
          title: 'Bem Vindo!',
        }}
      />

      <Tab.Screen
        name="ParceiroDataScreen"
        component={ParceiroDataScreen}
        options={{
          tabBarLabel: 'Dados',
          title: 'Meus Dados',
        }}
      />
    </Tab.Navigator>
  );
};

export default ParceiroLoggedDrawerNavigator;
