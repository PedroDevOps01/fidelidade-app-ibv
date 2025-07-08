import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, ScrollView, SafeAreaView, Animated, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { Card, useTheme, Text, Portal, ActivityIndicator, Avatar, Button, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { card_data } from './card_data';
import { promotion_data } from './promotion_data';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import PagarmeErrorsDialog from './pagarme-errors-dialog';
import { TouchableOpacity } from 'react-native';
import { navigate } from '../../router/navigationRef';
import InadimplenciaDialog from './inadimplencias-dialog';
import { useConsultas } from '../../context/consultas-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../network/api';
import { formatDateToDDMMYYYY, generateRequestHeader } from '../../utils/app-utils';
import MinimalCardComponent from './minimal-card-component';
import BannerHorizontalItem from './banner-card-component';
import LoadingFull from '../../components/loading-full';
import { Image } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const parceirosInfo = {
  paguemenos: {
    nome: 'Pague Menos',
    descricao: 'Rede de farmácias com os melhores preços e descontos exclusivos para nossos clientes.',
    beneficios: ['Descontos em medicamentos', 'Programa de fidelidade', 'Atendimento especializado'],
  },
  magalu: {
    nome: 'Magazine Luiza',
    descricao: 'Loja departamental com diversas categorias de produtos e entrega rápida.',
    beneficios: ['Frete grátis para clientes premium', 'Ofertas exclusivas', 'Parcele em até 12x'],
  },
  depi: {
    nome: 'Espaço Laser',
    descricao: 'Clínica especializada em depilação a laser e tratamentos estéticos.',
    beneficios: ['Sessões com desconto', 'Pacotes promocionais', 'Profissionais qualificados'],
  },
} as const;

const LoggedHome = ({ route, navigation }: { route: any; navigation: any }) => {
  type ParceiroId = keyof typeof parceirosInfo;

  const { colors } = useTheme();
  const { dadosUsuarioData, userCreditCards, setCreditCards, userContracts, setContracts } = useDadosUsuario();
  const { authData } = useAuth();
  const { setUserSchedulesData, userSchedules } = useConsultas();
  const [lastHistoricSchedule, setLastHistoricSchedule] = useState<UserSchedule | null>(null);

  const [pagarmeErrors, setPagarmeErrors] = useState<ErrorCadastroPagarme | null>();
  const [pagarmeErrorsDialogVisible, setPagarmeErrorsDialogVisible] = useState<boolean>(false);
  const [inadimplenciasDialogVisible, setInadimplenciasDialogVisible] = useState<boolean>(false);
  const [schedulesLoading, setSchedulesLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollXPromo = useRef(new Animated.Value(0)).current;
  const scrollXConsultas = useRef(new Animated.Value(0)).current;
  const isLogged = !dadosUsuarioData.user.id_usuario_usr ? false : true;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParceiro, setSelectedParceiro] = useState<ParceiroId | null>(null);

  // Data for the "Mais Consultas" carousel with multiple items for carousel behavior
  const maisConsultasData = [
    {
      id: 'paguemenos',
      image: require('../../assets/images/paguemenos3.jpeg'),
      action: () => handleParceiroPress('paguemenos'),
    },
    // {
    //   id: 'magalu',
    //   image: require('../../assets/images/magalu.jpeg'),
    //   action: () => handleParceiroPress('magalu'),
    // },
    // {
    //   id: 'depi',
    //   image: require('../../assets/images/depi.jpeg'),
    //   action: () => handleParceiroPress('depi'),
    // },
  ];
  const handleParceiroPress = (parceiroId: ParceiroId) => {
    setSelectedParceiro(parceiroId);
    setModalVisible(true);
  };
  async function fetchLastHistoricSchedule(): Promise<void> {
    const token = dadosUsuarioData.pessoaDados?.cod_token_pes!;
    if (!token) return;

    try {
      const response = await api.get(`/integracao/listHistoricoAgendamentos?token_paciente=${token}`, generateRequestHeader(authData.access_token));
      const data = response.data;
      if (data.length > 0) {
        setLastHistoricSchedule(data[0]); // Pega o mais recente (posição 0 da lista)
      }
    } catch (error) {
      console.log('Erro ao buscar histórico mais recente:', error);
    }
  }
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

  async function fetchAllData() {
    Promise.allSettled([
      fetchCreditCards(dadosUsuarioData.pessoaDados?.id_pessoa_pes!),
      fetchContratos(dadosUsuarioData.user.id_pessoa_usr),
      fetchSchedules(authData.access_token),
      fetchLastHistoricSchedule(), // <-- vírgula corrigida
    ])
      .then(_ => {})
      .catch(err => {
        console.log('erro em alguma promise: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const renderPromoIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {promotion_data.map((_, i) => {
          const opacity = scrollXPromo.interpolate({
            inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={`promo-indicator-${i}`}
              style={[
                styles.indicator,
                {
                  backgroundColor: colors.primary,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderConsultasIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {maisConsultasData.map((_, i) => {
          const opacity = scrollXConsultas.interpolate({
            inputRange: [(i - 1) * (SCREEN_WIDTH * 0.9 + 10), i * (SCREEN_WIDTH * 0.9 + 10), (i + 1) * (SCREEN_WIDTH * 0.9 + 10)],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={`consultas-indicator-${i}`}
              style={[
                styles.indicator,
                {
                  backgroundColor: colors.primary,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderConsultasItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={item.action}
        style={{
          width: SCREEN_WIDTH * 0.7,
          marginRight: index === maisConsultasData.length - 1 ? 0 : 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={item.image}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 15,
            backgroundColor: '#f0f0f0', // opcional, para destacar a borda da imagem
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {loading ? (
        <LoadingFull title="Carregando..." />
      ) : (
        <ScrollView style={[styles.container]} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          {/* Header moderno com efeito de profundidade */}
          <View
            style={[
              styles.headerContainer,
              {
                backgroundColor: '#FEF7FF',
                paddingBottom: 20,
                paddingTop: 16,
                elevation: 6,
              },
            ]}>
            <View style={styles.userInfoContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <Text variant="titleLarge" style={[styles.welcomeText, { color: '#b183ff', marginRight: 6 }]}>
                  {isLogged ? `Bem vind${dadosUsuarioData.pessoaDados?.des_sexo_biologico_pes === 'M' ? 'o' : 'a'},` : `Bem vindo!`}
                </Text>
                {isLogged && (
                  <Text variant="titleLarge" style={[styles.userName, { color: '#b183ff' }]}>
                    {dadosUsuarioData.pessoaDados?.des_genero_pes}!!
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Seção de cards de acesso rápido */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Nossos Parceiros
              </Text>
              <Button mode="text" compact labelStyle={{ fontSize: 12, color: colors.primary }} onPress={() => navigation.navigate('ParceirosScreen')}>
                Ver todos
              </Button>
            </View>

            <Animated.FlatList
              data={maisConsultasData}
              renderItem={renderConsultasItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SCREEN_WIDTH * 0.8}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: (SCREEN_WIDTH - SCREEN_WIDTH * 0.99) / 2,
              }}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollXConsultas } } }], { useNativeDriver: true })}
              scrollEventThrottle={16}
              removeClippedSubviews={true}
              snapToAlignment="start"
              pagingEnabled={false}
              initialNumToRender={3}
              windowSize={5}
              getItemLayout={(data, index) => ({
                length: SCREEN_WIDTH * 0.7 + 10,
                offset: (SCREEN_WIDTH * 0.7 + 10) * index,
                index,
              })}
            />
            {renderConsultasIndicator()}
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Acesso rápido
              </Text>
            </View>
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

          {/* Seção de consultas com dois carrosséis */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Marcar Consultas
              </Text>
            </View>
            {/* Carrossel de Promoções */}
            <View>
              <Animated.FlatList
                data={promotion_data}
                renderItem={({ item }) => <BannerHorizontalItem item={item} colors={colors} />}
                keyExtractor={item => item.title}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SCREEN_WIDTH * 0.9 + 10}
                decelerationRate="fast"
                contentContainerStyle={{
                  marginTop: 16,
                  paddingVertical: 8,
                  paddingHorizontal: 2,
                  width: '100%',
                }}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollXPromo } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
                removeClippedSubviews={false}
              />
              {renderPromoIndicator()}
            </View>

            {/* Carrossel de Mais Consultas */}
          </View>

          {/* Seção de agendamentos com design moderno */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Próximos agendamentos
              </Text>
              <Button mode="text" compact labelStyle={{ fontSize: 12, color: colors.primary }} onPress={() => navigate('user-schedules')}>
                Ver todos
              </Button>
            </View>
            {schedulesLoading ? (
              <ActivityIndicator style={{ marginTop: 10 }} color={colors.primary} />
            ) : (
              <>
                {userSchedules.length === 0 ? (
                  <Card mode="elevated" style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigate('user-schedules')} contentStyle={{ borderRadius: 16 }}>
                    <Card.Content style={styles.emptyCardContent}>
<Text
  variant="titleMedium"
  style={{
    color: colors.onSurface,
    marginTop: 10,
    textAlign: 'center', // centraliza o texto
  }}>
  Nenhum agendamento
</Text>
                      <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
                        Toque para agendar uma nova consulta
                      </Text>
                    </Card.Content>
                  </Card>
                ) : (
                  <Card onPress={() => navigate('user-schedules')} mode="elevated" style={[styles.card, { backgroundColor: colors.surface }]} contentStyle={{ borderRadius: 16 }}>
                    <Card.Content>
                      <View style={styles.scheduleCardContent}>
                        <Avatar.Image source={{ uri: userSchedules[0].fachada_profissional }} size={60} style={[styles.avatar, { backgroundColor: colors.background }]} />
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
                            <View style={[styles.dateBadge, { backgroundColor: colors.primaryContainer }]}>
                              <Text variant="labelSmall" style={{ color: colors.onPrimaryContainer, fontWeight: 'bold' }}>
                                {formatDateToDDMMYYYY(userSchedules[0].data)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <IconButton icon="chevron-right" size={24} iconColor={colors.onSurfaceVariant} />
                      </View>
                    </Card.Content>
                  </Card>
                )}
              </>
            )}
          </View>

          {/* Seção de histórico com design moderno */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Histórico de atendimentos
              </Text>
              <Button mode="text" compact labelStyle={{ fontSize: 12, color: colors.primary }} onPress={() => navigate('user-shcdules-history-screen')}>
                Ver histórico
              </Button>
            </View>

            {lastHistoricSchedule ? (
              <Card
                onPress={() => navigate('user-shcdules-history-screen')}
                mode="elevated"
                style={[styles.card, { backgroundColor: colors.surface }]}
                contentStyle={{ borderRadius: 16 }}>
                <Card.Content>
                  <View style={styles.scheduleCardContent}>
                    <Avatar.Image source={{ uri: lastHistoricSchedule.fachada_profissional }} size={60} style={[styles.avatar, { backgroundColor: colors.background }]} />
                    <View style={styles.scheduleInfo}>
                      <Text variant="titleMedium" style={{ color: colors.onSurface, fontWeight: '600' }}>
                        {Array.isArray(lastHistoricSchedule.nome_procedimento) ? lastHistoricSchedule.nome_procedimento.join(', ') : lastHistoricSchedule.nome_procedimento}
                      </Text>
                      <View style={styles.professionalContainer}>
                        <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: '500' }}>
                          {lastHistoricSchedule.nome_profissional ?? 'Exame'}
                        </Text>
                      </View>
                      <View style={styles.dateContainer}>
                        <View style={[styles.dateBadge, { backgroundColor: colors.primaryContainer }]}>
                          <Text variant="labelSmall" style={{ color: colors.onPrimaryContainer, fontWeight: 'bold' }}>
                            {formatDateToDDMMYYYY(lastHistoricSchedule.data)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <IconButton icon="chevron-right" size={24} iconColor={colors.onSurfaceVariant} />
                  </View>
                </Card.Content>
              </Card>
            ) : (
              <Card
                onPress={() => navigate('user-shcdules-history-screen')}
                mode="elevated"
                style={[styles.card, { backgroundColor: colors.surface }]}
                contentStyle={{ borderRadius: 16 }}>
                <Card.Content style={styles.emptyCardContent}>
                  <Text variant="titleMedium" style={{ color: colors.onSurface, marginTop: 10,     textAlign: 'center', // centraliza o texto
 }}>
                    Nenhum atendimento realizado
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
                    Toque para visualizar o histórico quando disponível
                  </Text>
                </Card.Content>
              </Card>
            )}
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          {selectedParceiro && (
            <>
              <Image source={maisConsultasData.find(p => p.id === selectedParceiro)?.image} style={styles.modalImage} />

              <View style={styles.modalContent}>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  {parceirosInfo[selectedParceiro]?.nome}
                </Text>

                <Text variant="bodyMedium" style={styles.modalDescription}>
                  {parceirosInfo[selectedParceiro]?.descricao}
                </Text>

                <Text variant="titleSmall" style={styles.modalSectionTitle}>
                  Benefícios:
                </Text>

                {parceirosInfo[selectedParceiro]?.beneficios.map((beneficio, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <IconButton icon="check-circle" size={16} iconColor={colors.primary} style={styles.benefitIcon} />
                    <Text variant="bodyMedium" style={styles.benefitText}>
                      {beneficio}
                    </Text>
                  </View>
                ))}

                <Button
                  mode="contained"
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('ParceirosScreen');
                  }}
                  style={styles.modalButton}
                  labelStyle={styles.modalButtonText}>
                  Ver mais detalhes
                </Button>

                <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.modalCloseButton} labelStyle={styles.modalCloseButtonText}>
                  Fechar
                </Button>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 20,
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: '500',
  },
  userName: {
    fontSize: 25,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.2,
  },
  subSectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  emptyCardContent: {},
  scheduleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    marginRight: 16,
    borderRadius: 12,
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
    marginTop: 8,
  },
  dateBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  historyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  historyIcon: {
    marginRight: 16,
    padding: 10,
  },
  historyText: {
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  modalContent: {
    paddingHorizontal: 10,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
  },
  modalSectionTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    margin: 0,
    marginRight: 8,
    padding: 0,
  },
  benefitText: {
    flex: 1,
  },
  modalButton: {
    marginTop: 20,
    borderRadius: 10,
    paddingVertical: 8,
  },
  modalButtonText: {
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
  },
  modalCloseButtonText: {
    fontWeight: 'bold',
  },
});

export default LoggedHome;
