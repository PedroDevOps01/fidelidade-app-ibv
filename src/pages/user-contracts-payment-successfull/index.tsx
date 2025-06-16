import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button, useTheme, IconButton } from 'react-native-paper';
import { goHome, reset } from '../../router/navigationRef';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { generateRequestHeader } from '../../utils/app-utils';
import { useAuth } from '../../context/AuthContext';

export default function UserContractPaymentSuccessfull() {
  const { colors } = useTheme();
  const { dadosUsuarioData, setDadosUsuarioData } = useDadosUsuario();
  const { authData } = useAuth();

  const handlePress = async () => {
    //fazer fetch novamente para atualizar o context
    goHome();
    const response = await api.get(`/refresh/${dadosUsuarioData.pessoaDados?.id_pessoa_pes}`, generateRequestHeader(authData.access_token));

    if (response.status == 200) {
      console.log('200');
      const { data } = response;

      setDadosUsuarioData({
        pessoa: { ...data.user, cod_cpf_pes: dadosUsuarioData.pessoa?.cod_cpf_pes },
        pessoaDados: data.dados,
        pessoaAssinatura: data.assinatura,
        errorCadastroPagarme: data.errorCadastroPagarme,
        user: data.user,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card mode="contained" style={styles.card}>
        <View style={styles.iconContainer}>
          <IconButton icon="check-circle" size={64} iconColor={colors.primary} style={styles.icon} />
        </View>

        <Card.Content>
          <Text style={styles.title}>Pagamento Realizado com Sucesso!</Text>
          <Text style={styles.message}>Seu pagamento está sendo processado no momento. Agora, você pode continuar utilizando nossos serviços.</Text>
        </Card.Content>

        <Button
          mode="contained"
          onPress={handlePress} // Substitua 'HomeScreen' pela rota desejada
          style={{ marginTop: 10 }}>
          Continuar
        </Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  button: {},
});
