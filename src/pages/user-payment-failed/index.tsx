import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button, useTheme, IconButton } from 'react-native-paper';
import { goHome } from '../../router/navigationRef';

export default function UserContractPaymentFailed() {
  const { colors } = useTheme();

  const handleTryAgain = () => {
    goHome(); // Ou redireciona para a tela de pagamento novamente, se preferir
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card mode="contained" style={styles.card}>
        <View style={styles.iconContainer}>
          <IconButton icon="alert-circle" size={64} iconColor={colors.error} style={styles.icon} />
        </View>

        <Card.Content>
          <Text style={styles.title}>Falha no Pagamento</Text>
          <Text style={styles.message}>
            Ocorreu um problema ao processar o seu pagamento. Por favor, verifique os dados e tente novamente.
          </Text>
        </Card.Content>

        <Button
          mode="contained"
          onPress={handleTryAgain}
          style={{ marginTop: 10 }}
          buttonColor={colors.error}
        >
          Tentar novamente
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
    color: '#B00020', // vermelho escuro
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
});
