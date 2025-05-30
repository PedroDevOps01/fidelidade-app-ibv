import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Button, useTheme, List, RadioButton } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { fetchOptionsAutoFormaPagamentoContract } from '../../utils/fetch-select-data';
import { useAuth } from '../../context/AuthContext';
import { navigate } from '../../router/navigationRef';
import LoadingFull from '../../components/loading-full';

export default function UserPaymentContractResumeScreen() {
  const route = useRoute();
  const { colors } = useTheme();
  const { authData } = useAuth();
  const item = route.params?.item;

  // Forma de pagamentos
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true)
  // const [selectedFormasPagamento, setSelectedFormasPagamento] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true)
      const data = await fetchOptionsAutoFormaPagamentoContract(authData.access_token);
      const newData = data.filter((item: any) => {
        if (String(item.id_forma_pagamento_fmp).length == 5 && String(item.id_forma_pagamento_fmp).slice(0, 2) == '10') {
          return item;
        }
      });
      setFormasPagamento(newData);
      setLoading(false)
    })();
  }, []);

  const handleSubmit = (selectedFormasPagamento: string) => {
    if (!selectedFormasPagamento) {
      console.log('Nenhuma forma de pagamento selecionada');
      return;
    }

    if (selectedFormasPagamento == '10001') {
      navigate('user-payment-screen', {
        item,
        formaPagamento: formasPagamento.find(forma => forma.id_forma_pagamento_fmp.toString() === selectedFormasPagamento),
      });
    }

    if (selectedFormasPagamento == '10002') {
      navigate('user-payment-creditcard-screen', {
        item,
        formaPagamento: formasPagamento.find(forma => forma.id_forma_pagamento_fmp.toString() === selectedFormasPagamento),
      });
    }
  };

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text>Nenhum dado encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <List.Section title='Selecione uma Forma de pagamento'>
          <FlatList
            data={formasPagamento}
            renderItem={({ item }) => (
              <List.Item
                title={item.des_nome_fmp}
                right={props => <List.Icon {...props} icon={'chevron-right'} />}
                onPress={() => handleSubmit(String(item.id_forma_pagamento_fmp))}
              />
            )}
            removeClippedSubviews={false}
          />
        </List.Section>
      )}
    </View>
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
