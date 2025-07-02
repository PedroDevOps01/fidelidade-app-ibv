import { View, StyleSheet, FlatList, ScrollView, SafeAreaView, Image } from 'react-native';
import { Card, useTheme, Text, Portal, ActivityIndicator, Avatar, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
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
  const [inadimplenciasDialogVisible, setInadimplenciasDialogVisible] = useState<boolean>(false);
  const [schedulesLoading, setSchedulesLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const isLogged = !dadosUsuarioData.user.id_usuario_usr ? false : true;

  useEffect(() => {
    if (dadosUsuarioData.pessoa?.cod_cep_pda != undefined && !dadosUsuarioData.pessoaAssinatura) {
      navigation.navigate('user-contracts-stack');
    }
  }, [dadosUsuarioData]);

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
        <ScrollView 
          style={[styles.container]} 
          contentContainerStyle={{ paddingBottom: 0 }} 
          showsVerticalScrollIndicator={false}
        >
          {/* Header com boas-vindas */}
          <View style={styles.headerContainer}>
            <View style={styles.userInfoContainer}>
              <View style={[styles.headerContainer, { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }]}>
                <Text variant="titleLarge" style={[styles.welcomeText, { color: colors.onSurface, marginRight: 4 }]}>
                  {isLogged ? `Bem vind${dadosUsuarioData.pessoaDados?.des_sexo_biologico_pes === 'M' ? 'o' : 'a'},` : `Bem vindo!!`}
                </Text>
                {isLogged && (
                  <Text variant="titleLarge" style={[styles.userName, { color: colors.primary }]}>
                    {dadosUsuarioData.pessoaDados?.des_genero_pes}!!
                  </Text>
                )}
              </View>

              <Avatar.Icon 
              size={50} 
              icon="account" 
              style={styles.userAvatar} 
              color={colors.onPrimary}
            />
            </View>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              O que deseja fazer hoje?
            </Text>
          </View>

          {/* Seção de cards de acesso rápido */}
          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Acesso rápido
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
          </View>

          {/* Seção de promoções */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Marcar Consultas
              </Text>
             
            </View>
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
          </View>

          {/* Seção de agendamentos */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Próximos agendamentos
              </Text>
              <Button 
                mode="text" 
                compact
                labelStyle={{ fontSize: 12 }}
                onPress={() => navigate('user-schedules')}
              >
                Ver todos
              </Button>
            </View>
            
            {schedulesLoading ? (
              <ActivityIndicator style={{ marginTop: 10 }} color={colors.primary} />
            ) : (
              <>
                {userSchedules.length === 0 ? (
                  <Card 
                    mode="contained" 
                    style={[styles.card, { backgroundColor: '#F7F3FA' }]}
                    onPress={() => navigate('user-schedules')}
                  >
                   <Card.Content style={styles.emptyCardContent}>
                    
                    <Text variant="titleMedium" style={{ color: colors.onSurface, marginTop: 10 }}>
                      Nenhum agendamento próximo
                    </Text>
                    <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
                      Toque para agendar uma nova consulta ou exame
                    </Text>
                  </Card.Content>
                  </Card>
                ) : (
                  <Card
                    onPress={() => navigate('user-schedules')}
                    mode="contained"
                    style={[styles.card, { backgroundColor: '#F7F3FA' }]}
                  >
                    <Card.Content>
                      <View style={styles.scheduleCardContent}>
                        <Avatar.Image
                          source={{ uri: userSchedules[0].fachada_profissional }}
                          size={60}
                          style={styles.avatar}
                        />
                        <View style={styles.scheduleInfo}>
                          <Text variant="titleMedium" style={{ color: colors.onSurface, fontWeight: '600' }}>
                            {userSchedules[0].nome_procedimento?.join(', ') ?? userSchedules[0].nome_procedimento}
                          </Text>
                          <View style={styles.professionalContainer}>
                            <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: '500' }}>
                              {userSchedules[0].nome_profissional ?? 'Exame'}
                            </Text>
                          </View>
                          <View style={styles.dateContainer}>
                            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                              Data:
                            </Text>
                            <Text variant="bodyMedium" style={{ color: colors.onSurface, fontWeight: '500', marginLeft: 5 }}>
                              {formatDateToDDMMYYYY(userSchedules[0].data)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                )}
              </>
            )}
          </View>

          {/* Seção de histórico */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Histórico de atendimentos
              </Text>
              <Button 
                mode="text" 
                compact
                labelStyle={{ fontSize: 12 }}
                onPress={() => navigate('user-shcdules-history-screen')}
              >
                Ver histórico
              </Button>
            </View>
            <Card
              onPress={() => navigate('user-shcdules-history-screen')}
              mode="contained"
              style={[styles.card, { backgroundColor: '#F7F3FA' }]}
            >
              <Card.Content style={styles.historyCardContent}>
                <View style={styles.historyIcon}>
                  <Avatar.Icon 
                    size={48}
                    icon="clipboard-text-clock-outline"
                    color={colors.onTertiary}
                  />
                </View>
                <View style={styles.historyText}>
                  <Text variant="titleMedium" style={{ color: colors.onSurface, fontWeight: '600' }}>
                    Seu histórico de consultas
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                    Veja todos os seus atendimentos anteriores
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>

         

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
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 15,
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: -4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  userAvatar: {
    backgroundColor: 'transparent',
  },
  sectionContainer: {
    marginBottom: 20,
    
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
  },
  horizontalListContent: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    marginBottom :15,
  },
  emptyCardContent: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    width: 80,
    height: 80,
    opacity: 0.7,
  },
  scheduleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
  },
  avatar: {
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  scheduleInfo: {
    flex: 1,
  },
  professionalContainer: {
    marginVertical: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  historyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  historyIcon: {
    marginRight: 16,
  },
  historyIconImage: {
    width: 40,
    height: 40,
  },
  historyText: {
    flex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardContentLeft: {
    flex: 1,
  },
  cardImage: {
    width: 60,
    height: 40,
    marginLeft: 10,
  },
});

export default LoggedHome;