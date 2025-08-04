import { useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FAB, Text, useTheme } from 'react-native-paper';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { toast } from 'sonner-native';
import LoadingFull from '../../components/loading-full';
import { generateRequestHeader, maskBrazilianCurrency } from '../../utils/app-utils';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import ModalContainer from '../../components/modal';
import { ModalContent } from '../../components/modal-content';
import { navigate } from '../../router/navigationRef';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function UserDependentsScreen() {
  const { colors } = useTheme();
  const { userContracts } = useDadosUsuario();
  const { authData } = useAuth();
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOfQtdMaxDepPlaVisible, setIsModalOfQtdMaxDepPlaVisible] = useState(false);

  async function fetchDependentes() {
    setLoading(true);

    const contratoId = userContracts.filter(e => e.is_ativo_ctt == 1)[0].id_contrato_ctt;
    const response = await api.get(`/contrato/${contratoId}/dependente`, generateRequestHeader(authData.access_token));

    if (response.status == 200) {
      const { data } = response;
      setDependentes(data.response.data);
      setLoading(false);
    } else {
      toast.error('Erro ao carregar dependentes!', { position: 'bottom-center' });
      setLoading(false);
    }
  }

  function handleFabPress() {
    if (dependentes.length >= userContracts[0].qtd_max_dependentes_pla!) {
      setIsModalOfQtdMaxDepPlaVisible(true);
      return;
    }
    navigate('register-step-one', { tipo: 'DEPENDENT' });
  }

  useEffect(() => {
    (async () => {
      fetchDependentes();
    })();
  }, []);

  return (
    <KeyboardAwareScrollView
      refreshControl={
        <RefreshControl 
          refreshing={loading} 
          onRefresh={fetchDependentes}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <>
          <ModalContainer visible={isModalOfQtdMaxDepPlaVisible} handleVisible={() => setIsModalOfQtdMaxDepPlaVisible(false)}>
            <ModalContent
              confirmButtonAction={() => {
                navigate('register-step-one', { tipo: 'DEPENDENT' });
                setIsModalOfQtdMaxDepPlaVisible(false);
              }}
              confirmButtonText="Sim"
              description={`A quantidade de dependentes sem custo adicional está cheia. Deseja adicionar mais um dependente por ${maskBrazilianCurrency(
                userContracts[0].vlr_dependente_adicional_pla ?? 0,
              )}?`}
              isBackButtonVisible
              title="Aviso"
              backButtonAction={() => setIsModalOfQtdMaxDepPlaVisible(false)}
              backButtonText="Não"
            />
          </ModalContainer>

          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>Meus Dependentes</Text>
            <Text style={styles.subtitle}>
              {dependentes.length}/{userContracts[0]?.qtd_max_dependentes_pla || 0} cadastrados sem custo
            </Text>
          </View>

          {dependentes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="account-multiple" size={48} color={colors.primary} style={styles.emptyIcon} />
              <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                Nenhum dependente cadastrado
              </Text>
            </View>
          ) : (
            <View style={styles.dependentsList}>
              {dependentes.map((dependente, index) => (
                <View key={index} style={[styles.dependentCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.dependentHeader}>
                    <Icon name="account-circle" size={24} color={colors.primary} />
                    <Text style={[styles.dependentName, { color: colors.onSurface }]}>
                      {dependente.des_nome_pes}
                    </Text>
                  </View>
                  <View style={styles.dependentDetail}>
                    <Text style={[styles.dependentDate, { color: colors.onSurfaceVariant }]}>
                      Cadastrado em: {dayjs(dependente.dth_cadastro_rtd).format('DD/MM/YYYY')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
      <FAB 
        icon="plus" 
        style={[styles.fab, { backgroundColor: colors.primary }]} 
        color={colors.onPrimary}
        onPress={handleFabPress} 
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },
  dependentsList: {
    marginTop: 8,
  },
  dependentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dependentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dependentName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  dependentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dependentDate: {
    fontSize: 14,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 20,
    bottom: 20,
    borderRadius: 28,
  },
});