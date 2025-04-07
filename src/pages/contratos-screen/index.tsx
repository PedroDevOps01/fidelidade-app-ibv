import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import React, { useCallback, useState } from 'react';
import ContratoCard from './contrato-card';
import Fab from '../../components/fab';
import { navigate } from '../../router/navigationRef';
import UserPaymentAttemptScreen from '../user-payment-attempt-screen';
import ContratosDetailScreen from '../contrato-detail-screen';

const ContratosScreen = () => {
  //const navigation = useNavigation<ContratosNavigationProp>();

  //const {contratosData, setContratosData, clearContratosData} = useContratos();

  const theme = useTheme();

  const { authData } = useAuth();
  const { userContracts, setContracts, dadosUsuarioData } = useDadosUsuario();
  const [loading, setLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');

  async function fetchContratos() {
    setLoading(true);

    try {
      const resp = await api.get(`/contrato?id_pessoa_ctt=${dadosUsuarioData.user.id_pessoa_usr}&is_ativo_ctt=1`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      if (resp.status == 200) {
        const { data: content } = resp;
        setContracts(content.response.data);
      }
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(() => {
    (async () => {
      await fetchContratos();
    })();
  }, []);

  const renderItem = ({ item }: { item: ContratoResponse }) => {
    const query = searchQuery.toLowerCase();
    if (item.des_nome_pla.toLowerCase().includes(query) || item.id_contrato_ctt.toString().includes(query)) {
      return <ContratoCard item={item} />;
    }
    return null; // Não renderiza o item se não corresponder ao searchQuery
  };

  const ContratoList = ({ data }: { data: ContratoResponse[] }) => {
    if (data.length == 0) {
      return <UserPaymentAttemptScreen />;
    }

    return (
      <ContratosDetailScreen contrato={userContracts.filter(e => e.is_ativo_ctt == 1)[0]} title='teste' />
    );
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
      {loading ? <ActivityIndicator size={60} /> : <ContratoList data={userContracts} />}
      </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
});

export default ContratosScreen;
