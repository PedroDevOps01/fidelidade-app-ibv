import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, List, RadioButton } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { fetchOptionsAutoFormaPagamentoContract } from '../../utils/fetch-select-data';
import { useAuth } from '../../context/AuthContext';
import { navigate } from '../../router/navigationRef';

export default function UserPaymentContractResumeScreen() {
  const route = useRoute();
  const { colors } = useTheme();
  const { authData } = useAuth();
  const item = route.params?.item;

  // Forma de pagamentos
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [selectedFormasPagamento, setSelectedFormasPagamento] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const data = await fetchOptionsAutoFormaPagamentoContract(authData.access_token);
      const newData = data.filter((item: any) => {
        if(String(item.id_forma_pagamento_fmp).length == 5 && String(item.id_forma_pagamento_fmp).slice(0,2) == "10") {
          return item
        }
      })
      setFormasPagamento(newData);
    })();
  }, []);

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text>Nenhum dado encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card mode="contained" style={styles.card}>
        <Card.Content>
          <List.Section>
            {/* Forma de Pagamento - Exibe Radio Buttons */}
            <View style={styles.radioGroup}>
              <Text style={styles.radioGroupLabel}>Forma de Pagamento:</Text>
              <RadioButton.Group
                onValueChange={value => setSelectedFormasPagamento(value)}
                value={selectedFormasPagamento ? selectedFormasPagamento : 'Não definido'}>
                {formasPagamento.map(forma => (
                  <RadioButton.Item
                    key={forma.id_forma_pagamento_fmp}
                    label={forma.des_nome_fmp}
                    value={forma.id_forma_pagamento_fmp.toString()}
                    color={colors.primary}
                  />
                ))}
              </RadioButton.Group>
            </View>
          </List.Section>
        </Card.Content>
      </Card>

      {!item.des_descricao_tsi && (
        <Button
          key={selectedFormasPagamento ? 'enabled' : 'disabled'}
          mode="contained"
          onPress={() => {
            if (!selectedFormasPagamento) {
              console.log('Nenhuma forma de pagamento selecionada');
              return;
            }

            if (selectedFormasPagamento == '10001') {
              navigate('user-payment-screen', {
                item,
                formaPagamento: formasPagamento.find(
                  forma => forma.id_forma_pagamento_fmp.toString() === selectedFormasPagamento,
                ),
              });
            }

            if (selectedFormasPagamento == '10002') {
              navigate('user-payment-creditcard-screen', {
                item,
                formaPagamento: formasPagamento.find(
                  forma => forma.id_forma_pagamento_fmp.toString() === selectedFormasPagamento,
                ),
              });
            }
          }}
          style={styles.payButton}
          disabled={selectedFormasPagamento ? false : true}>
          Realizar Pagamento
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  payButton: {
    marginTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioGroup: {
    marginTop: 16,
  },
  radioGroupLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
