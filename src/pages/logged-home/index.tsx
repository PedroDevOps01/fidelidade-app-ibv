import { View, StyleSheet, FlatList, ScrollView, SafeAreaView } from 'react-native';
import { Card, useTheme, Text, Portal, ActivityIndicator, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { card_data } from './card_data';
import { promotion_data } from './promotion_data';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import PagarmeErrorsDialog from './pagarme-errors-dialog';
import { navigate } from '../../router/navigationRef';
import InadimplenciaDialog from './inadimplencias-dialog';
import { useConsultas } from '../../context/consultas-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../network/api';
import { formatDateToDDMMYYYY, generateRequestHeader } from '../../utils/app-utils';
import MinimalCardComponent from './minimal-card-component';
import React from 'react';
import BannerHorizontalItem from './banner-card-component';
import LoadingFull from '../../components/loading-full';

const LoggedHome = ({ route, navigation }: { route: any; navigation: any }) => {
  const { colors } = useTheme();
  const { dadosUsuarioData, userCreditCards, setCreditCards, userContracts, setContracts } = useDadosUsuario();
  const { authData } = useAuth();
  const { setUserSchedulesData, userSchedules } = useConsultas();

  const [pagarmeErrors, setPagarmeErrors] = useState<ErrorCadastroPagarme | null>();
  const [pagarmeErrorsDialogVisible, setPagarmeErrorsDialogVisible] = useState<boolean>(false);
  //const [inadimplencias, setInadimplencias] = useState<PessoaAssinaturaInadimplencia[] | null>();
  const [inadimplenciasDialogVisible, setInadimplenciasDialogVisible] = useState<boolean>(false);
  const [schedulesLoading, setSchedulesLoading] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const isLogged = !dadosUsuarioData.user.id_usuario_usr ? false : true;


  useFocusEffect(
    useCallback(() => {
      if (dadosUsuarioData.user.id_usuario_usr != 0 && authData.access_token != '') {
        fetchAllData();
      }
    }, [dadosUsuarioData, authData]),
  );

  useFocusEffect(
    useCallback(() => {
      if (dadosUsuarioData.errorCadastroPagarme) {
        setPagarmeErrorsDialogVisible(true);
      }
      if (dadosUsuarioData.pessoaAssinatura?.inadimplencia.length! > 0) {
        console.log('entrou aqui');
        setInadimplenciasDialogVisible(true);
      }
    }, [dadosUsuarioData]),
  );

  async function fetchAllData() {
    Promise.allSettled([fetchCreditCards(dadosUsuarioData.pessoaDados?.id_pessoa_pes!), fetchContratos(dadosUsuarioData.user.id_pessoa_usr), fetchSchedules(authData.access_token)])
      .then(_ => {})
      .catch(err => {
        console.log('erro em alguma promise: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function fetchSchedules(access_token: string): Promise<void> {
    const token = dadosUsuarioData.pessoaDados?.cod_token_pes!;

    return new Promise(async (resolve, reject) => {
      if (userSchedules.length > 0) {
        reject('Já existem dados');
      }

      try {
        const response = await api.get(`/integracao/listAgendamentos?token_paciente=${token}`, generateRequestHeader(access_token));

        if (response.status == 200) {
          const { data } = response;
          setUserSchedulesData(data);
          resolve();
        }
      } catch (err: any) {
        //console.log(err);
        reject('Erro ao carregar os agendamentos: ');
      }
    });
  }

  async function fetchCreditCards(idPessoaPes: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (userCreditCards.length > 0) {
        reject('Já possuem cartoes de credito');
      }

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
          resolve();
        }
      } catch (err: any) {
        reject('Erro ao carregar cartões. Tente novamente mais tarde');
      }
    });
  }

  async function fetchContratos(id_pessoa_usr: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (userContracts.length > 0) {
        reject('Já existem contratos');
      }

      try {
        const resp = await api.get(`/contrato?id_pessoa_ctt=${id_pessoa_usr}`, generateRequestHeader(authData.access_token));

        if (resp.status == 200) {
          const { data: content } = resp;
          setContracts(content.response.data);
          resolve();
        }
      } catch (err: any) {
        reject(err.message);
      }
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {loading ? (
        <LoadingFull title="Carregando..." />
      ) : (
        <ScrollView style={[styles.container]} contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 10 }}>
            {isLogged ? `Bem vind${dadosUsuarioData.pessoaDados?.des_sexo_biologico_pes == 'M' ? 'o' : 'a'}, ${dadosUsuarioData.pessoaDados?.des_genero_pes}!` : `Bem vindo!`}
          </Text>

          <FlatList
            data={card_data}
            renderItem={({ item }) => <MinimalCardComponent item={item} colors={colors} />}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              marginTop: 16,
              paddingVertical: 8,
              paddingHorizontal: 2,
              width: '100%',
            }}
            removeClippedSubviews={false}
          />

          <FlatList
            data={promotion_data}
            renderItem={({ item, index }) => <BannerHorizontalItem item={item} colors={colors} />}
            keyExtractor={item => item.title}
            horizontal
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              marginTop: 10,
              paddingVertical: 8,
              paddingHorizontal: 2,
              width: '100%',
            }}
            removeClippedSubviews={false}
          />

          <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 16 }}>
            Próximos agendamentos
          </Text>

          {schedulesLoading ? (
            <ActivityIndicator style={{ marginTop: 30 }} color={colors.primary} />
          ) : (
            <>
              {userSchedules.length === 0 ? (
                <Card mode="elevated" style={{ marginRight: 0, marginTop: 16, borderWidth: 0.3, borderColor: colors.onSurfaceVariant }} onPress={() => navigate('user-schedules')}>
                  <Card.Title title="Nenhum agendamento próximo!" subtitle="Agendar uma nova consulta ou exame!" />
                </Card>
              ) : (
                <Card
                  onPress={() => navigate('user-schedules')}
                  mode="elevated"
                  style={{
                    marginTop: 16,
                    padding: 4,
                    paddingLeft: 0,
                    borderWidth: 0.3, borderColor: colors.onSurfaceVariant
                  }}>
                  <Card.Title
                    title={userSchedules[0].nome_procedimento}
                    subtitle={` ${userSchedules[0].nome_profissional ?? 'Exame'} \nData:${formatDateToDDMMYYYY(userSchedules[0].data)}`}
                    left={props => <Avatar.Image {...props} source={{ uri: userSchedules[0].fachada_profissional }} size={50} />}
                    subtitleNumberOfLines={2}
                  />
                </Card>
              )}
            </>
          )}

          <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 16 }}>
            Histórico de atendimentos
          </Text>

          <Card
            onPress={() => {
              navigate('user-shcdules-history-screen');
            }}
            mode="elevated"
            style={{
              marginRight: 0,
              marginTop: 16,
              padding: 4,
              paddingLeft: 0,
              marginBottom: 10,
              borderWidth: 0.3, borderColor: colors.onSurfaceVariant
            }}>
            <Card.Title
              title="Veja seus agendamentos realizados"
              subtitle="Clique aqui e confira!"
              subtitleNumberOfLines={1} // Reduz tamanho do subtítulo se necessário
              titleNumberOfLines={1} // Evita que o título quebre em várias linhas
            />
          </Card>

          <Portal>
            <PagarmeErrorsDialog
              errors={pagarmeErrors}
              visible={pagarmeErrorsDialogVisible}
              navigation={navigation}
              handlePress={status => {
                setPagarmeErrorsDialogVisible(status);
              }}
            />

            <InadimplenciaDialog
              errors={dadosUsuarioData.pessoaAssinatura?.inadimplencia}
              visible={inadimplenciasDialogVisible}
              navigation={navigation}
              handlePress={status => {
                setInadimplenciasDialogVisible(status);
              }}
            />
          </Portal>

          {/* 
        <Text>{JSON.stringify(dadosUsuarioData, null, 2)}</Text> */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Garante que a ScrollView ocupe todo o espaço disponível
    padding: 16,
  },
  card: {
    maxWidth: 200,
    flexWrap: 'wrap',
    minHeight: 100,
    height: 'auto',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  cardVertical: {
    marginRight: 10,
    maxWidth: 400,
    height: `auto`,
    minWidth: 350,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'red',
    color: 'white',
  },
});

export default LoggedHome;
