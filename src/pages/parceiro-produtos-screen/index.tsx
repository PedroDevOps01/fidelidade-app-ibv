import {SafeAreaView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Searchbar, useTheme} from 'react-native-paper';
import {useAuth} from '../../context/AuthContext';
import {useEffect, useState} from 'react';
import {api} from '../../network/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProdutosParceiroList from './produtos-list';
import Fab from '../../components/fab';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type navigationProps = NativeStackNavigationProp<{
  'parceiro-produto-router': any;
}>;

const ParceirosProdutosScreen = () => {
  const theme = useTheme();
  const {authData} = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [data, setData] = useState<ProdutoParceiroResponse[]>([]);
  const navigation = useNavigation<navigationProps>();

  const [idParceiroPes, setIdParceiroPes] = useState<number>();

  const onRefresh = () => {
    fetchProdutos(idParceiroPes!);
  };

  useEffect(() => {
    fetchProdutos(idParceiroPes!);
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      const d = await AsyncStorage.getItem('user_data');
      const {pessoaDados: parsedD} = JSON.parse(d!);
      if (parsedD.id_parceiro_pes) {
        console.log('parsedD.id_parceiro_pes', parsedD.id_parceiro_pes)


        setIdParceiroPes(parsedD.id_parceiro_pes);
        fetchProdutos(parsedD.id_parceiro_pes);
      }
    })();
  }, []);

  async function fetchProdutos(id_parceiro_pes: number) {
    setLoading(true);

    try {
      const resp = await api.get(
        `/produto-parceiro?id_parceiro_ppc=${id_parceiro_pes}${
          searchQuery != '' ? `&des_nome_produto_ppc=${searchQuery}` : ``
        }`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `bearer ${authData.access_token}`,
          },
        },
      );

      if (resp.status == 200) {
        const {data: content} = resp;
        setData(content.response.data);
      }
    } catch (err: any) {
      console.log(
        'fetchProdutos err: ',
        JSON.stringify(err.response.data, null, 2),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Searchbar
        placeholder="Pesquisar"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{marginHorizontal: 10, marginTop: 10, marginBottom: 10}}
      />

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
          }}>
          <ActivityIndicator size={40} />
        </View>
      ) : (
        <>
          <ProdutosParceiroList
            data={data}
            loading={loading}
            onRefresh={onRefresh}
          />
          <Fab
            icon="plus"
            onPress={() => {
              navigation.navigate('parceiro-produto-router');
            }}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Garante que os elementos com position: 'absolute' se posicionem em relação a este container
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
});

export default ParceirosProdutosScreen;
