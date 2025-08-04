import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTheme, Button, Title, Paragraph } from 'react-native-paper';
import { goBack, navigate } from '../../router/navigationRef';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useDadosUsuario } from '../../context/pessoa-dados-context';

type UserPaymentAttemptScreenRouteParams = {
  params: {
    url: string;
  };
};

export default function UserPaymentAttemptScreen() {
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario()
  const isLogged = !dadosUsuarioData.user.id_usuario_usr ? false : true;


  const route = useRoute<RouteProp<UserPaymentAttemptScreenRouteParams, 'params'>>();

  const url = 'user-contracts-presenter-screen'

  console.log(url)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Title style={[styles.title, { color: colors.primary }]}>Assine o Plano Fidelidade!</Title>
      </View>

      {/* Conteúdo Principal */}
      <ScrollView contentContainerStyle={styles.content}>
        <Paragraph style={[styles.paragraph]}>Desbloqueie todos os recursos exclusivos e aproveite ao máximo o nosso aplicativo!</Paragraph>

        <Paragraph style={[styles.paragraph]}>Confira nossos planos e tenha acesso a:</Paragraph>

        <View style={styles.benefitsContainer}>
          <Paragraph style={[styles.benefit]}>✔️ Telemedicina sem custo adicional</Paragraph>
          <Paragraph style={[styles.benefit]}>✔️ Descontos em consultas e exames</Paragraph>
          <Paragraph style={[styles.benefit]}>✔️ Agendamento personalizado</Paragraph>
          <Paragraph style={[styles.benefit]}>✔️ Dependentes por plano</Paragraph>
        </View>
      </ScrollView>

      {/* Rodapé com Botão de Assinatura */}
      <View style={styles.footer}>
        <Button key={'assinar_plano'} mode="contained" onPress={() => {
          
          if(!isLogged) {
            navigate('user-login-screen-new-contract')
            return
          }
          
          navigate(url)
          
          
          }} labelStyle={styles.buttonLabel}>
          Confira nossos planos
        </Button>

        <View style={{ height: 10 }} />

        <Button key={'voltar_free'} mode="outlined" onPress={() => goBack()}>
          Continuar com plano gratuito
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 40,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    marginTop: 16,
  },
  benefit: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
