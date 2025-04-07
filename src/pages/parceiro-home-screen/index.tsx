import React, {useState} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {
  ActivityIndicator,
  useTheme,
  Text,
  Avatar,
  Title,
  Paragraph,
  List,
  Button,
  Divider,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {useDadosUsuario} from '../../context/pessoa-dados-context';
import {useContratos} from '../../context/contratos-context';

const ParceiroHomeScreen = () => {
  const navigation = useNavigation();
  const {contratosData, setContratosData, clearContratosData} = useContratos();
  const theme = useTheme();
  const {authData} = useAuth();
  const {loginUsuarioData} = useDadosUsuario();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <View
      style={[
        styles.outerContainer,
        {backgroundColor: theme.colors.background},
      ]}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Avatar.Icon size={80} icon="handshake" style={styles.avatar} />
            <Title style={styles.title}>Bem-vindo ao App Parceiro!</Title>
          </View>

          <Paragraph style={styles.paragraph}>
            Gerencie seus produtos e{' '}
            serviços de forma simples e
            rápida.
          </Paragraph>

          <List.Section style={styles.listSection}>
            <List.Item
              title="Acessar"
              description="Acesse seu catálogo atualizado"
              left={() => <List.Icon icon="package-variant" />}
            />
            <Divider />
            <List.Item
              title="Cadastrar"
              description="Cadastre novos produtos e serviços"
              left={() => <List.Icon icon="plus-box" />}
            />
            <Divider />
            <List.Item
              title="Mantenha tudo em dia"
              description="Mantenha tudo em dia para oferecer o melhor aos seus clientes"
              left={() => <List.Icon icon="wrench" />}
              style={{flexDirection: 'column', alignItems: 'flex-start'}}
            />
          </List.Section>

          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('parceiro-produto-router')}
            style={styles.button}>
            Cadastrar Produto ou Serviço
          </Button>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: '#6200ee',
  },
  title: {
    marginTop: 16,
    fontSize: 28,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 22,
  },
  listSection: {
    marginVertical: 24,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
});

export default ParceiroHomeScreen;
