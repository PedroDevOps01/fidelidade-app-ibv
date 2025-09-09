import { useTheme } from 'react-native-paper';
import { Dimensions, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../network/api';
import { generateRequestHeader } from '../../utils/app-utils';
import { useEffect, useState } from 'react';
import LoadingFull from '../../components/loading-full';
import ContractDetailCard from './contract-details-card';
import { useAccquirePlan } from '../../context/accquirePlanContext';
import { navigate } from '../../router/navigationRef';
import { useNavigation } from '@react-navigation/native';

export default function ContractsPresenterScreen() {
  const { colors } = useTheme();
  const { authData } = useAuth();
  const { plano, setPlano } = useAccquirePlan();
  const navigation = useNavigation();

  const [loading, setLoading] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plano[]>([]);
  const orderedPlans = [...plans].sort((a, b) => {
    if (a.id_plano_pla === 72) return -1; // Popular primeiro
    if (b.id_plano_pla === 72) return 1;
    return a.vlr_adesao_pla - b.vlr_adesao_pla;
  });

  async function fetchPlans() {
    setLoading(true);
    try {
      const response = await api.get('/plano?is_ativo_pla=1&is_plano_b2b_pla=0', generateRequestHeader(authData?.access_token));
      const { data } = response;
      setPlans(data.response.data);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await fetchPlans();
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.fundo }]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <FlatList
          data={orderedPlans} // Changed from plans to orderedPlans
          style={{ width: Dimensions.get('window').width }}
          contentContainerStyle={{ padding: 16 }}
          keyExtractor={item => item.id_plano_pla!.toString()}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <ContractDetailCard
              contract={item}
              onPress={() => {
                setPlano(item);
                navigate('user-contracts-payment-method');
              }}
            />
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPlans} />}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});