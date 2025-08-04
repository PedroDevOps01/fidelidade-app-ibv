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
import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Parceiro {
  id_parceiro_prc: number;
  des_nome_fantasia_prc: string;
  des_razao_social_prc: string;
  des_endereco_prc: string;
  des_complemento_prc: string;
  des_bairro_prc: string;
  des_municipio_mun: string;
  des_email_responsavel_prc: string;
  des_nome_responsavel_prc: string;
  des_endereco_web_prc: string;
  cod_documento_prc: string;
  num_celular_prc: string;
  num_telefone_prc: string;
  img_parceiro_prc: string | null;
  is_ativo_prc: number;
  is_parceiro_padrao_prc: number;
  dth_cadastro_prc: string;
  dth_alteracao_prc: string;
  id_municipio_prc: number;
  des_parceiro_prc: string | null;
  num_cred_prc: string | null;
  cred_ativo_prc: '0' | '1' | null;
}

const LoggedHome = ({ route, navigation }: { route: any; navigation: any }) => {
  const { colors } = useTheme();
  const { dadosUsuarioData, userCreditCards, setCreditCards, userContracts, setContracts } = useDadosUsuario();
  const { authData } = useAuth();
  const { setUserSchedulesData, userSchedules } = useConsultas();
  const [lastHistoricSchedule, setLastHistoricSchedule] = useState<UserSchedule | null>(null);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [parceirosCredenciados, setParceirosCredenciados] = useState<Parceiro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pagarmeErrors, setPagarmeErrors] = useState<ErrorCadastroPagarme | null>(null);
  const [pagarmeErrorsDialogVisible, setPagarmeErrorsDialogVisible] = useState<boolean>(false);
  const [inadimplenciasDialogVisible, setInadimplenciasDialogVisible] = useState<boolean>(false);
  const [schedulesLoading, setSchedulesLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollXPromo = useRef(new Animated.Value(0)).current;
  const scrollXConsultas = useRef(new Animated.Value(0)).current;
  const scrollXCredenciados = useRef(new Animated.Value(0)).current;
  const isLogged = !dadosUsuarioData.user.id_usuario_usr ? false : true;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCredenciadosVisible, setModalCredenciadosVisible] = useState(false);
  const [selectedParceiroId, setSelectedParceiroId] = useState<number | null>(null);
  const [selectedParceiroCredenciadoId, setSelectedParceiroCredenciadoId] = useState<number | null>(null);
  const requestLocationPermission = async () => {
    const result = await request(Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    console.log('Resultado da permissão:', result);
  };

  // Map API data to carousel items for all partners
  const maisConsultasData = parceiros.map(parceiro => ({
    id: parceiro.id_parceiro_prc.toString(),
    image: parceiro.img_parceiro_prc ? { uri: `${parceiro.img_parceiro_prc}` } : require('../../assets/images/logonova.png'),
    action: () => handleParceiroPress(parceiro.id_parceiro_prc),
  }));

  // Map API data to carousel items for accredited partners
  const maisConsultasCredenciadosData = parceirosCredenciados.map(parceiro => ({
    id: parceiro.id_parceiro_prc.toString(),
    image: parceiro.img_parceiro_prc ? { uri: `${parceiro.img_parceiro_prc}` } : require('../../assets/images/logonova.png'),
    action: () => handleParceiroCredenciadoPress(parceiro.id_parceiro_prc),
  }));

  const handleParceiroPress = (parceiroId: number) => {
    setSelectedParceiroId(parceiroId);
    setModalVisible(true);
  };

  const handleParceiroCredenciadoPress = (parceiroId: number) => {
    setSelectedParceiroCredenciadoId(parceiroId);
    setModalCredenciadosVisible(true);
  };

  async function fetchLastHistoricSchedule(): Promise<void> {
    const token = dadosUsuarioData.pessoaDados?.cod_token_pes!;
    if (!token) return;

    try {
      const response = await api.get(`/integracao/listHistoricoAgendamentos?token_paciente=${token}`, generateRequestHeader(authData.access_token));
      const data = response.data;
      // console.log('Histórico de agendamentos:', data);
      if (data.length > 0) {
        setLastHistoricSchedule(data[0]);
      }
    } catch (error) {
      console.log('Erro ao buscar histórico mais recente:', error);
    }
  }

  async function fetchParceiros(): Promise<void> {
    try {
      const headers = isLogged
        ? generateRequestHeader(authData.access_token)
        : {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          };
      const response = await api.get('/parceiro/app', headers);
      const dataApi = response.data;
      if (dataApi && dataApi.response && dataApi.response.data && dataApi.response.data.length > 0) {
        // console.log('Parceiros encontrados:', dataApi.response.data);
        setParceiros(dataApi.response.data);
      } else {
        console.log('Nenhum parceiro encontrado');
      }
    } catch (error: any) {
      console.error('Erro ao buscar parceiros:', error.message, error.response?.data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchParceirosCredenciados(): Promise<void> {
    try {
      setLoading(true);
      const headers = isLogged
        ? generateRequestHeader(authData.access_token)
        : {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          };
      const response = await api.get('/parceiro/appcred', headers);
      const dataApi = response.data;
      if (dataApi && dataApi.response && dataApi.response.data && dataApi.response.data.length > 0) {
        // console.log('Parceiros credenciados encontrados:', dataApi.response.data);
        setParceirosCredenciados(dataApi.response.data);
      } else {
        console.log('Nenhum parceiro credenciado encontrado');
      }
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchParceiros();
      fetchParceirosCredenciados(); // Fetch accredited partners when view is focused
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (dadosUsuarioData.user.id_usuario_usr != 0 && authData.access_token != '') {
        fetchAllData();
      }
    }, [dadosUsuarioData, authData]),
  );
  useEffect(() => {
    if (dadosUsuarioData.pessoa?.cod_cep_pda != undefined && !dadosUsuarioData.pessoaAssinatura) {
      navigation.navigate('user-contracts-stack');
    }
  }, [dadosUsuarioData]);

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
    setLoading(true);
    Promise.allSettled([
      fetchCreditCards(dadosUsuarioData.pessoaDados?.id_pessoa_pes!),
      fetchContratos(dadosUsuarioData.user.id_pessoa_usr),
      fetchSchedules(authData.access_token),
      fetchLastHistoricSchedule(),
      fetchParceiros(),
      fetchParceirosCredenciados(),
    ])
      .then(_ => {})
      .catch(err => {
        console.log('Erro em alguma promise: ', err);
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

  const renderCredenciadosIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {maisConsultasCredenciadosData.map((_, i) => {
          const opacity = scrollXCredenciados.interpolate({
            inputRange: [(i - 1) * (SCREEN_WIDTH * 0.9 + 10), i * (SCREEN_WIDTH * 0.9 + 10), (i + 1) * (SCREEN_WIDTH * 0.9 + 10)],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={`credenciados-indicator-${i}`}
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
            backgroundColor: '#fff', // <-- alterado para branco
          }}
        />
      </TouchableOpacity>
    );
  };

  const renderCredenciadosItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={item.action}
        style={{
          width: SCREEN_WIDTH * 0.7,
          marginRight: index === maisConsultasCredenciadosData.length - 1 ? 0 : 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={item.image}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 15,
            backgroundColor: '#fff', // <-- alterado para branco
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
        <ScrollView style={[styles.container]} contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
          {/* Error Display */}
          {error && <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>{error}</Text>}

          {/* Header */}
          <View style={styles.userInfoResponsive}>
            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>{isLogged ? `Bem vind${dadosUsuarioData.pessoaDados?.des_sexo_biologico_pes === 'M' ? 'o' : 'a'},` : `Bem vindo!`}</Text>
              {isLogged && <Text style={styles.nameText}>{dadosUsuarioData.pessoaDados?.des_genero_pes}!!</Text>}
            </View>

            <Image source={require('../../assets/images/logotransparente.png')} style={styles.responsiveLogo} resizeMode="contain" />
          </View>

          {/* Parceiros Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Nossos Parceiros
              </Text>
              <Button mode="text" compact labelStyle={{ fontSize: 12, color: colors.primary }} onPress={() => navigation.navigate('ParceirosScreen', { partnerType: 'regular' })}>
                Ver todos
              </Button>
            </View>
            {parceiros.length > 0 && (
              <>
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
              </>
            )}
          </View>

          {/* Acesso Rápido Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Acesso rápido
              </Text>
              <View style={[styles.titleDecorator, { backgroundColor: colors.primary }]} />
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

          {/* Consultas Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Marcar Consultas
              </Text>
              <View style={[styles.titleDecorator, { backgroundColor: colors.primary }]} />
            </View>
            <View>
              <Animated.FlatList
                data={promotion_data}
                renderItem={({ item }) => <BannerHorizontalItem item={item} colors={colors} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  marginTop: 16,
                  paddingVertical: 8,
                  width: '100%',
                }}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollXPromo } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
              />
              {renderPromoIndicator()}
            </View>
          </View>

          {/* Parceiros Credenciados Section */}
          {/* <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Parceiros Credenciados
              </Text>
              <Button
                mode="text"
                compact
                labelStyle={{ fontSize: 12, color: colors.primary }}
                onPress={() => navigation.navigate('ParceirosScreen', { partnerType: 'accredited' })}>
                Ver todos
              </Button>
            </View>
            {parceirosCredenciados.length > 0 && (
              <>
                <Animated.FlatList
                  data={maisConsultasCredenciadosData}
                  renderItem={renderCredenciadosItem}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={SCREEN_WIDTH * 0.8}
                  decelerationRate="fast"
                  contentContainerStyle={{
                    paddingHorizontal: (SCREEN_WIDTH - SCREEN_WIDTH * 0.99) / 2,
                  }}
                  onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollXCredenciados } } }], { useNativeDriver: true })}
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
                {renderCredenciadosIndicator()}
              </>
            )}
          </View> */}

          {/* Próximos Agendamentos Section */}
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
                          textAlign: 'center',
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

          {/* Histórico de Atendimentos Section */}
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
                  <Text
                    variant="titleMedium"
                    style={{
                      color: colors.onSurface,
                      marginTop: 10,
                      textAlign: 'center',
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

          {/* Modal for Parceiros */}
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
              {selectedParceiroId && (
                <>
                  {(() => {
                    const selectedParceiro = parceiros.find(p => p.id_parceiro_prc === selectedParceiroId);
                    return selectedParceiro ? (
                      <>
                        <Image
                          source={selectedParceiro.img_parceiro_prc ? { uri: `${selectedParceiro.img_parceiro_prc}` } : require('../../assets/images/logonova.png')}
                          style={styles.modalImage}
                        />
                        <View style={styles.modalContent}>
                          <Text variant="titleLarge" style={styles.modalTitle}>
                            {selectedParceiro.des_nome_fantasia_prc}
                          </Text>
                          <Text variant="bodyMedium" style={styles.modalDescription}>
                            {selectedParceiro.des_razao_social_prc} - {selectedParceiro.des_endereco_prc}, {selectedParceiro.des_bairro_prc}, {selectedParceiro.des_municipio_mun}
                          </Text>
                          <Text variant="titleSmall" style={styles.modalSectionTitle}>
                            Contato:
                          </Text>
                          <View style={styles.benefitItem}>
                            <IconButton icon="email" size={16} iconColor={colors.primary} style={styles.benefitIcon} />
                            <Text variant="bodyMedium" style={styles.benefitText}>
                              {selectedParceiro.des_email_responsavel_prc}
                            </Text>
                          </View>
                          <View style={styles.benefitItem}>
                            <IconButton icon="phone" size={16} iconColor={colors.primary} style={styles.benefitIcon} />
                            <Text variant="bodyMedium" style={styles.benefitText}>
                              {selectedParceiro.num_celular_prc || selectedParceiro.num_telefone_prc}
                            </Text>
                          </View>
                          <Text variant="titleSmall" style={styles.modalSectionTitle}>
                            Dados:
                          </Text>

                          <View style={styles.benefitItem}>
                            <IconButton icon="card-text" size={16} iconColor={colors.primary} style={styles.benefitIcon} />
                            <Text variant="bodyMedium" style={styles.benefitText}>
                              Descrição: {selectedParceiro.des_parceiro_prc || 'N/A'}
                            </Text>
                          </View>
                          <Button
                            mode="contained"
                            onPress={() => {
                              setModalVisible(false);
                              navigation.navigate('ParceirosScreen', { partnerType: 'regular' });
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
                    ) : null;
                  })()}
                </>
              )}
            </View>
          </Modal>

          {/* Modal for Parceiros Credenciados */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalCredenciadosVisible}
            onRequestClose={() => {
              setModalCredenciadosVisible(false);
            }}>
            <TouchableWithoutFeedback onPress={() => setModalCredenciadosVisible(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            <View style={styles.modalContainer}>
              {selectedParceiroCredenciadoId && (
                <>
                  {(() => {
                    const selectedParceiro = parceirosCredenciados.find(p => p.id_parceiro_prc === selectedParceiroCredenciadoId);
                    console.log('Selected Credenciado:', selectedParceiro);
                    return selectedParceiro ? (
                      <>
                        <Image
                          source={selectedParceiro.img_parceiro_prc ? { uri: `${selectedParceiro.img_parceiro_prc}` } : require('../../assets/images/logonova.png')}
                          style={styles.modalImage}
                        />
                        <View style={styles.modalContent}>
                          <Text variant="titleLarge" style={styles.modalTitle}>
                            {selectedParceiro.des_nome_fantasia_prc}
                          </Text>
                          <Text variant="bodyMedium" style={styles.modalDescription}>
                            {selectedParceiro.des_razao_social_prc} - {selectedParceiro.des_endereco_prc}, {selectedParceiro.des_bairro_prc}, {selectedParceiro.des_municipio_mun}
                          </Text>
                          <Text variant="titleSmall" style={styles.modalSectionTitle}>
                            Contato:
                          </Text>
                          <View style={styles.benefitItem}>
                            <IconButton icon="email" size={16} iconColor={colors.primary} style={styles.benefitIcon} />
                            <Text variant="bodyMedium" style={styles.benefitText}>
                              {selectedParceiro.des_email_responsavel_prc}
                            </Text>
                          </View>
                          <View style={styles.benefitItem}>
                            <IconButton icon="phone" size={16} iconColor={colors.primary} style={styles.benefitIcon} />
                            <Text variant="bodyMedium" style={styles.benefitText}>
                              {selectedParceiro.num_celular_prc || selectedParceiro.num_telefone_prc}
                            </Text>
                          </View>
                          <Text variant="titleSmall" style={styles.modalSectionTitle}>
                            Dados:
                          </Text>
                          <View style={styles.benefitItem}>
                            <IconButton icon="card-text" size={16} iconColor={colors.primary} style={styles.benefitIcon} />
                            <Text variant="bodyMedium" style={styles.benefitText}>
                              Nº Credenciamento: {selectedParceiro.num_cred_prc || 'N/A'}
                            </Text>
                          </View>

                          <View style={styles.benefitItem}>
                            <IconButton icon="card-text" size={16} iconColor={colors.primary} style={styles.benefitIcon} />
                            <Text variant="bodyMedium" style={styles.benefitText}>
                              Descrição: {selectedParceiro.des_parceiro_prc || 'N/A'}
                            </Text>
                          </View>
                          <Button
                            mode="contained"
                            onPress={() => {
                              setModalCredenciadosVisible(false);
                              navigation.navigate('ParceirosScreen', { partnerType: 'accredited' });
                            }}
                            style={styles.modalButton}
                            labelStyle={styles.modalButtonText}>
                            Ver mais detalhes
                          </Button>
                          <Button mode="outlined" onPress={() => setModalCredenciadosVisible(false)} style={styles.modalCloseButton} labelStyle={styles.modalCloseButtonText}>
                            Fechar
                          </Button>
                        </View>
                      </>
                    ) : null;
                  })()}
                </>
              )}
            </View>
          </Modal>
        </ScrollView>
      )}
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
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    paddingTop: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogo: {
    width: 120,
    height: 88,
    borderRadius: 10,
    marginTop: 0,
  },
  appName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },

  userName: {
    fontSize: 25,
    fontWeight: '700',
  },
  sectionContainer: {

    marginTop:10,
    marginBottom: 14,
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
    maxHeight: '100%',
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  titleDecorator: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 40,
    height: 3,
    borderRadius: 2,
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

  userInfoResponsive: {
    flexDirection: 'row',
    backgroundColor: '#b183ff',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  textContainer: {
    flexShrink: 1,
    maxWidth: '70%',
  },

  welcomeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 2,
  },

  nameText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },

  responsiveLogo: {
     width: 120,
    height: 88,
    borderRadius: 10,
    marginTop: 0,
  },
});

export default LoggedHome;
