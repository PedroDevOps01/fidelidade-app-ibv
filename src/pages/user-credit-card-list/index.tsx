import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { FAB, useTheme } from 'react-native-paper';
import { api } from '../../network/api';
import { useCallback, useState } from 'react';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import CreditCard from './credit-card';
import { navigate } from '../../router/navigationRef';
import { generateRequestHeader } from '../../utils/app-utils';

export default function UserCreditCardList() {
  const { authData } = useAuth();
  const { colors } = useTheme();
  const { dadosUsuarioData, userCreditCards, setCreditCards } = useDadosUsuario();

  const [loading, setLoading] = useState<boolean>(false);

  const fetchCreditCards = async (idPessoaPes: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/integracaoPagarMe/consultarCartaoCliente?id_pessoa_pes=${idPessoaPes}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      if (response.status == 200) {
        const { data } = response;
        setCreditCards(data.data);
      }
    } catch (err: any) {
      Alert.alert('Aviso', 'Erro ao carregar cartões. Tente novamente mais tarde');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  async function deleteCreditCard(card_id: string) {
    if (card_id) {
      const idPessoaPes = dadosUsuarioData.pessoaDados?.id_pessoa_pes!;

      Alert.alert('Aviso', 'Deseja deletar este cartão', [
        {
          text: 'Sim',
          onPress: async () => {
            try {
              const response = await api.delete(`/integracaoPagarMe/excluirCartaoCliente?id_pessoa_pes=${idPessoaPes}&card_id=${card_id}`, {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  Authorization: `bearer ${authData.access_token}`,
                },
              });

              if (response.status == 200) {
                Alert.alert('Aviso', response.data.message ?? 'Cartão excluido com sucesso!');
              }
            } catch (err: any) {
              Alert.alert('Aviso', 'Erro ao excluir cartão. Tente novamente mais tarde');
              console.log(err);
            } finally {
              const cardsUpdated = userCreditCards.filter(e => e.id !== card_id);
              setCreditCards(cardsUpdated);
            }
          },
        },
        {
          text: 'Não',
          onPress: () => {
            return;
          },
        },
      ]);
    }
  }

  const onRefresh = useCallback(() => {
    fetchCreditCards(dadosUsuarioData.pessoaDados?.id_pessoa_pes!);
  }, [dadosUsuarioData, authData]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={userCreditCards}
        renderItem={({ item }) => (
          <CreditCard
            card={item}
            onDeletePress={card_id => {
              deleteCreditCard(card_id);
            }}
          />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      />

      <FAB
        style={[styles.fab, { backgroundColor: colors.primary }]}
        icon="plus" // Ícone do FAB
        color={colors.onPrimary}
        onPress={() => {
          navigate('user-create-credit-card-screen');
        }} // Lógica ao pressionar o FAB
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 40,
    elevation: 4, // Sombra do FAB
  },
});
