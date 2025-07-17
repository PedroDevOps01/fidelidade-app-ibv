import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { FAB, useTheme, Text, IconButton } from 'react-native-paper';
import { api } from '../../network/api';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native'; // 👈 Adicionado

import { useDadosUsuario } from '../../context/pessoa-dados-context';
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
  useFocusEffect(
      useCallback(() => {
        const idPessoaPes = dadosUsuarioData.pessoaDados?.id_pessoa_pes;
        if (idPessoaPes) {
          fetchCreditCards(idPessoaPes);
        }
      }, [dadosUsuarioData?.pessoaDados?.id_pessoa_pes])
    );
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

  // Função para obter a imagem da bandeira do cartão
  const getCardBrandImage = (brand: string) => {
    const brands: Record<string, string> = {
      'visa': 'credit-card',
      'mastercard': 'credit-card',
      'amex': 'credit-card',
      'diners': 'credit-card',
      'discover': 'credit-card',
      'jcb': 'credit-card',
      'aura': 'credit-card',
      'elo': 'credit-card',
    };
    
    return brands[brand.toLowerCase()] || 'credit-card';
  };

  // Função para obter a cor baseada na bandeira
  const getCardBrandColor = (brand: string) => {
    const brandColors: Record<string, string> = {
      'visa': '#1a1f71',
      'mastercard': '#eb001b',
      'amex': '#002663',
      'diners': '#008ed0',
      'discover': '#ff6000',
      'jcb': '#0b407f',
      'elo': '#4D1979',
      'aura': '#6F2C91',
      'default': '#2c3e50',
    };
    
    return brandColors[brand.toLowerCase()] || brandColors['default'];
  };

  // Função para obter a cor secundária baseada na bandeira
  const getCardBrandSecondaryColor = (brand: string) => {
    const brandColors: Record<string, string> = {
      'visa': '#f7b600',
      'mastercard': '#f79e1b',
      'amex': '#0070d2',
      'diners': '#00a0e0',
      'discover': '#ff8000',
      'jcb': '#d6262d',
      'elo': '#FF6C00',
      'aura': '#2C91B0',
      'default': '#4a6491',
    };
    
    return brandColors[brand.toLowerCase()] || brandColors['default'];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {userCreditCards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineMedium" style={[styles.emptyTitle, { color: colors.onSurface }]}>
            Nenhum cartão cadastrado
          </Text>
          <Text variant="bodyMedium" style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
            Adicione um cartão para facilitar seus pagamentos
          </Text>
        </View>
      ) : (
        <FlatList
          data={userCreditCards}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              {/* Cartão de crédito */}
              <View style={[
                styles.card, 
                { 
                  backgroundColor: getCardBrandColor(item.brand),
                  borderColor: getCardBrandSecondaryColor(item.brand),
                }
              ]}>
                {/* Efeito de chip */}
                
                
                {/* Nome da bandeira */}
                <View style={styles.cardBrandContainer}>
                  <Text variant="titleLarge" style={styles.cardBrandText}>
                    {item.brand === 'visa' ? 'VISA' : 
                     item.brand === 'mastercard' ? 'MASTERCARD' : 
                     item.brand === 'amex' ? 'AMERICAN EXPRESS' : 
                     item.brand.charAt(0).toUpperCase() + item.brand.slice(1)}
                  </Text>
                </View>
                
                {/* Número do cartão */}
                <View style={styles.cardNumberContainer}>
                  <Text variant="titleLarge" style={styles.cardNumber}>
                    •••• {item.last_four_digits}  
                  </Text>
                </View>
                
                {/* Informações do titular e validade */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text variant="bodySmall" style={styles.cardLabel}>
                      TITULAR
                    </Text>
                    <Text variant="bodyLarge" style={styles.cardText}>
                      {item.holder_name.toUpperCase()}
                    </Text>
                  </View>
                  
                  <View style={styles.cardExpiry}>
                    <Text variant="bodySmall" style={styles.cardLabel}>
                      VALIDADE
                    </Text>
                    <Text variant="bodyLarge" style={styles.cardText}>
                      {item.exp_month.toString().padStart(2, '0')}/{item.exp_year.toString().slice(-2)}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Botão de exclusão */}
              <IconButton
                icon="trash-can-outline"
                iconColor={colors.error}
                size={24}
                onPress={() => deleteCreditCard(item.id)}
                style={styles.deleteButton}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          removeClippedSubviews={false}
          keyExtractor={(item) => item.id}
        />
      )}

      <FAB
        style={[styles.fab, { backgroundColor: colors.primary }]}
        icon="plus"
        color={colors.onPrimary}
        onPress={() => navigate('user-create-credit-card-screen')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: 300,
  },
  cardContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  card: {
    borderRadius: 12,
    padding: 24,
    height: 200,
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 4,
    overflow: 'hidden',
  },
  chipContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  chip: {
    width: 50,
    height: 40,
    backgroundColor: '#d4af37',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipLines: {
    width: 40,
    height: 30,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#b38c25',
    borderRadius: 4,
  },
  cardBrandContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardBrandText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  cardNumberContainer: {
    marginTop: 60,
    marginBottom: 20,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 4,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cardExpiry: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  listContent: {
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 40,
    elevation: 4,
    borderRadius: 50,
  },
});