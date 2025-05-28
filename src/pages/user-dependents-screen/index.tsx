import { useEffect, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FAB, List, Text, useTheme } from 'react-native-paper';
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

export default function UserDependentsScreen() {
  const { colors } = useTheme();
  const { userContracts } = useDadosUsuario();
  const { authData } = useAuth();
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOfQtdMaxDepPlaVisible, setIsModalOfQtdMaxDepPlaVisible] = useState(false);

  async function fetchDependentes() {
    setLoading(true);

    console.log(userContracts.filter(e => e.is_ativo_ctt == 1)[0]);

    const contratoId = userContracts.filter(e => e.is_ativo_ctt == 1)[0].id_contrato_ctt;

    const response = await api.get(`/contrato/${contratoId}/dependente`, generateRequestHeader(authData.access_token));

    console.log('data', response.status);
    if (response.status == 200) {
      const { data } = response;
      setDependentes(data.response.data);
      setLoading(false);
    } else {
      toast.error('Erro ao carregar dependentes!', { position: 'bottom-center' });
      setLoading(false);
    }
  }

  // handle do fab
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
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchDependentes()} />}
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

          <List.Section>
            {dependentes.map((e, i) => (
              <List.Item key={i} title={e.des_nome_pes} description={`Data de cadastro: ${dayjs(e.dth_cadastro_rtd).format('DD/MM/YYYY')}`} />
            ))}
          </List.Section>
        </>
      )}
      <FAB icon="plus" style={styles.fab} onPress={() => handleFabPress()} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 10,
    bottom: 30,
  },
});
