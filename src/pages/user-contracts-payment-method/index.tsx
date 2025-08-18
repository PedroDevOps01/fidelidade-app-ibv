import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { List, Text, useTheme } from 'react-native-paper';
import { useAccquirePlan } from '../../context/accquirePlanContext';
import { useEffect, useState } from 'react';
import { api } from '../../network/api';
import { generateRequestHeader } from '../../utils/app-utils';
import LoadingFull from '../../components/loading-full';
import { navigate } from '../../router/navigationRef';

export default function UserContractsPaymentMethod() {
  const { authData } = useAuth();
  const { colors } = useTheme();
  const { setIdFormaPagamento, idFormaPagamento } = useAccquirePlan();

  const [loading, setLoading] = useState<boolean>(false);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);

  async function getPaymentMethods() {
    setLoading(true);

    try {
      const request = await api.get('/formapagamento?is_ativo_fmp=1', generateRequestHeader(authData.access_token));
      const { data } = request;
      if (request.status == 200) {
        const trueData: FormaPagamento[] = data.response.data;

        if (trueData) {
          const filtered = trueData.filter(e => e.id_forma_pagamento_fmp.toString().length > 4);
          setFormasPagamento(filtered);
          console.log(data.response.data.length);
        }
      }
    } catch (err) {
      Alert.alert('Erro ao carregar as formas de pagamento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async function () {
      await getPaymentMethods();
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <LoadingFull />
      ) : (


        <FlatList
          ListHeaderComponent={() => <Text style={{ marginBottom: 16 }}>Selecione uma Forma de pagamento</Text>}
          data={formasPagamento}
          removeClippedSubviews={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setIdFormaPagamento(item.id_forma_pagamento_fmp);
                navigate('user-contracts-payment-method-router');
              }}>
              <View style={styles.content}>
                <Text style={styles.title}>{item.des_nome_fmp}</Text>
                <List.Icon icon="chevron-right" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
  },
});
