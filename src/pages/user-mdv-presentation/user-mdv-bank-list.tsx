import { List, useTheme } from 'react-native-paper';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../network/api';
import { generateRequestHeader } from '../../utils/app-utils';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import LoadingFull from '../../components/loading-full';
import Fab from '../../components/fab';
import { navigate } from '../../router/navigationRef';
import { useFocusEffect } from '@react-navigation/native';

type BankItem = {
  des_descricao_ban: string;
  cod_banco_ban: string;
  cod_agencia_pdb: string;
  cod_num_conta_pdb: string;
  des_tipo_pdb: string;
  is_ativo_pdb: number;
  cod_agencia_validador_pdb: string;
  cod_conta_validador_pdb: string;
  id_pessoa_banco_pdb: number;
};

export default function UserMdvBankList() {
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();
  const { authData } = useAuth();

  const [banks, setBanks] = useState<BankItem[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUserBanks = async () => {
    setLoading(true);
    let id_pessoa = dadosUsuarioData.pessoaDados?.id_pessoa_pes;
    const response = await api.get(`/pessoa/banco/${id_pessoa}`, generateRequestHeader(authData.access_token));

    if (response.status == 200) {
      const { data } = response;
      setBanks(data.response.data);
      setLoading(false);
    } else {
      Alert.alert('Erro', 'Erro ao carregar dados bancários. Tente novamente mais tarde');
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserBanks();
    }, [])
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background}]}>
      {loading ? (
        <LoadingFull title="Carregando" />
      ) : (
        <List.Section>
          <FlatList
            data={banks}
            renderItem={({ item }) => (
              <List.Item
                title={item.des_descricao_ban}
                description={item.des_tipo_pdb == 'poupanca' ? `Tipo: Poupança` : `Tipo: Corrente`}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
            )}
            removeClippedSubviews={false}
          />
        </List.Section>
      )}
      <Fab icon='plus' onPress={() =>{navigate('user-mdv-registration', {newAccount: false})}}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
});
