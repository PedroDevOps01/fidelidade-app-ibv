import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
        <List.Section title="Selecione uma Forma de pagamento">
          <FlatList
            data={formasPagamento}
            renderItem={({ item }) => (
              <List.Item
                title={item.des_nome_fmp}
                right={props => <List.Icon {...props} icon={'chevron-right'} />}
                onPress={() => {
                  setIdFormaPagamento(item.id_forma_pagamento_fmp);
                  navigate('user-contracts-payment-method-router');
                }}
              />
            )}
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
});
