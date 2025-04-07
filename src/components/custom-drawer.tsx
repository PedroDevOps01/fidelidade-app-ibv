import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {useDadosUsuario} from '../context/pessoa-dados-context';
import {useTheme} from 'react-native-paper';
import {CommonActions} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../context/AuthContext';
import {api} from '../network/api';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const theme = useTheme();

  const {authData} = useAuth();
  const {loginUsuarioData, clearLoginDadosUsuarioData, clearDadosUsuarioData} =
    useDadosUsuario();

  async function logout() {
    try {
      await api.post(
        '/logout',
        {},
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `bearer ${authData.access_token}`,
          },
        },
      );
      console.log('logout successfull');
    } catch (err: any) {
      console.log('logout err: ', JSON.stringify(err, null, 2));
    }
  }

  const handleLogout = () => {
    Alert.alert('Aviso', 'Deseja sair do aplicativo?', [
      {
        text: 'não',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: () => {
          clearDadosUsuarioData();
          clearLoginDadosUsuarioData();
          logout();
          props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'check-cpf'}],
            }),
          );
        },
      },
    ]);
    return true;
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Custom Header */}
      <View
        style={[styles.drawerHeader, {backgroundColor: theme.colors.surface}]}>
        <Text style={[styles.headerText, {color: theme.colors.onBackground}]}>
          {loginUsuarioData.des_nome_pes.split(' ')[0]}
        </Text>
      </View>

      {/* Default Drawer Items */}
      <DrawerItemList {...props} />

      {/* Custom Footer */}
      <TouchableOpacity style={styles.footerItem} onPress={handleLogout}>
        <Icon name="logout" size={24} color={theme.colors.error} />
        <Text style={[styles.footerText, {color: theme.colors.error}]}>
          Sair do sistema
        </Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'grey',
    textAlign: 'left',
  },
  footerItem: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    marginTop: 20,
    borderTopColor: '#f4f4f4',
  },
  footerText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
