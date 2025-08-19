import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, ScrollView, SafeAreaView, Animated, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { Card, useTheme, Text, Portal, ActivityIndicator, Avatar, Button, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { card_data } from './card_data';
import { promotion_data } from './promotion_data';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import PagarmeErrorsDialog from './pagarme-errors-dialog';
import ProximosAgendamentosDialog from './proximosagendamentosdialog';
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
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import CustomToast from '../../components/custom-toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UserSchedule {
  agenda_exames_id: string;
  nome_procedimento: string | string[];
  nome_profissional?: string;
  data: string;
  fachada_profissional?: string;
  inicio: string;
}

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

interface Termo {
  id_termo_declaracao_tde: number;
  des_descricao_tde: string;
  txt_texto_tde: string;
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
  const [agendamentosDialogVisible, setAgendamentosDialogVisible] = useState<boolean>(false);
  const [schedulesLoading, setSchedulesLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollXPromo = useRef(new Animated.Value(0)).current;
  const scrollXConsultas = useRef(new Animated.Value(0)).current;
  const scrollXCredenciados = useRef(new Animated.Value(0)).current;
  const isLogged = !!dadosUsuarioData.user.id_usuario_usr;
  const [showTerms, setShowTerms] = useState(false);
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCredenciadosVisible, setModalCredenciadosVisible] = useState(false);
  const [selectedParceiroId, setSelectedParceiroId] = useState<number | null>(null);
  const [selectedParceiroCredenciadoId, setSelectedParceiroCredenciadoId] = useState<number | null>(null);
  const [terms, setTerms] = useState<Termo[]>([]);
  const [termsLoading, setTermsLoading] = useState<boolean>(false);
  const [termsError, setTermsError] = useState<string | null>(null);
    const { setDadosUsuarioData, clearDadosUsuarioData } = useDadosUsuario();
useEffect(() => {
  const isSigned =
    dadosUsuarioData.pessoa?.is_assinado_pes === 1 ||
    dadosUsuarioData.pessoaDados?.is_assinado_pes === 1;

  const isLogged = !!dadosUsuarioData.user?.id_usuario_usr && !!authData.access_token;

  if (!isSigned && isLogged) {
    setShowTerms(true);
    fetchTerms();
  } else {
    setShowTerms(false);
  }
}, [dadosUsuarioData, authData.access_token]);
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: showTerms
        ? { display: 'none' }
        : {
            backgroundColor: colors.background,
            borderTopWidth: 0.3,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            elevation: 0,
          },
    });
  }, [navigation, showTerms, colors.background, insets.bottom]);

  async function createNotificationChannel() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'schedule-channel',
        name: 'Schedule Notifications',
        importance: AndroidImportance.HIGH,
      });
    }
  }

  async function fetchTerms(): Promise<void> {
    if (!authData.access_token) {
      setTermsError('Token de autenticação não disponível.');
      return;
    }

    setTermsLoading(true);
    setTermsError(null);

    try {
      const headers = generateRequestHeader(authData.access_token);
      const response = await api.get('/termo-declaracao?is_adesao_tde=1&is_ativo_tde=1', headers);
      const dataApi = response.data;
      if (dataApi?.response?.data?.length > 0) {
        setTerms(dataApi.response.data);
      } else {
        setTermsError('Nenhum termo encontrado.');
      }
    } catch (error: any) {
      console.error('Erro ao buscar termos:', error.message, error.response?.data);
      setTermsError('Erro ao buscar os termos. Tente novamente mais tarde.');
    } finally {
      setTermsLoading(false);
    }
  }

  const generateContractHtml = () => {
  let content = '';

  if (terms.length > 0) {
    content = terms

      .map(
        termo => `
        <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
         <h2 style="color: #3f51b5; font-size: 24px; margin-bottom: 15px; font-weight: 600; text-align: center;">
  ${termo.des_descricao_tde}
</h2>
          <div style="font-size: 14px; color: #333; line-height: 1.6;">
            ${termo.txt_texto_tde.split('\n').map(line => `<p style="margin-bottom: 10px;">${line.trim()}</p>`).join('')}
          </div>
        </div>
      `
      )
      .join('');
  } else {
    content = '<div style="text-align: center; padding: 40px; color: #666;"><p>Nenhum termo disponível.</p></div>';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
          line-height: 1.6; 
          padding: 20px;
          color: #333;
        }
        h2 { 
          color: #3f51b5; 
          font-size: 18px; 
          margin-bottom: 15px; 
          font-weight: 600;
        }
        p { 
          margin: 10px 0; 
          font-size: 14px;
        }
        strong {
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
};

  async function acceptTerms() {
    try {
      if (!isLogged) {
        setTermsError('Usuário não autenticado.');
        return;
      }

      let token = authData.access_token;
      if (!token) {
        setTermsError('Token de autenticação não disponível.');
        return;
      }
      console.log (dadosUsuarioData.pessoaDados?.id_pessoa_pes);
      const idPessoa = dadosUsuarioData.pessoaDados?.id_pessoa_pes;
      if (!idPessoa) {
        setTermsError('ID da pessoa não encontrado.');
        return;
      }

      const headers = generateRequestHeader(token);
   await api.put(`/pessoa/${idPessoa}`, { is_assinado_pes: 1 }, headers);

// Atualiza os dados do usuário
setDadosUsuarioData({
  ...dadosUsuarioData,
  pessoaDados: {
    ...dadosUsuarioData.pessoaDados,
    is_assinado_pes: 1,
  },
});
setShowTerms(false);

// Mensagem de sucesso
CustomToast('Termo aceito com sucesso!', colors, 'success');

    } catch (error: any) {
      console.error('Erro ao aceitar termos:', error.message);
      setTermsError('Erro ao aceitar os termos.');
    }
  }

  async function showAppointmentReminder(userId: string) {
    if (!userId) {
      console.error('ID do usuário inválido para notificação de agendamento');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const lastNotificationDate = await AsyncStorage.getItem(`last_notification_date_${userId}`);
    if (lastNotificationDate === today) {
      console.log('Notificação já enviada hoje, ignorando...');
      return;
    }

    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus !== 1) {
      console.log('Permissões de notificação não concedidas');
      return;
    }

    const schedules = userSchedules || [];
    const todayDateString = today;
    const todaySchedules = schedules.filter(schedule => schedule.data === todayDateString) || [];

    const scheduleNotificationId = `schedule-reminder-${userId}`;
    let title = 'Nenhum Agendamento para Hoje';
    let body = 'Você não tem agendamentos marcados para hoje.';

    if (todaySchedules.length > 0) {
      const summary = todaySchedules
        .map(schedule => `${Array.isArray(schedule.nome_procedimento) ? schedule.nome_procedimento.join(', ') : schedule.nome_procedimento} às ${schedule.inicio.substring(0, 5)}`)
        .join(', ');
      title = 'Lembrete de Agendamento!!';
      body = `Você tem agendamento(s) hoje: ${summary}`;
    }

    try {
      await notifee.displayNotification({
        id: scheduleNotificationId,
        title: title,
        body: body,
        android: {
          channelId: 'schedule-channel',
          smallIcon: 'ic_notification',
          color: '#b183ff',
          pressAction: { id: 'default' },
        },
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });
      await AsyncStorage.setItem(`last_notification_date_${userId}`, today);
    } catch (error) {
      console.error('Erro ao exibir notificação:', error);
    }
  }

  useEffect(() => {
    if (userSchedules && userSchedules.length > 0) {
      setAgendamentosDialogVisible(true);
    }
  }, [userSchedules]);

  const maisConsultasData = parceiros.map(parceiro => ({
    id: parceiro.id_parceiro_prc.toString(),
    image: parceiro.img_parceiro_prc ? { uri: `${parceiro.img_parceiro_prc}` } : require('../../assets/images/logonova.png'),
    action: () => handleParceiroPress(parceiro.id_parceiro_prc),
  }));

  const handleParceiroPress = (parceiroId: number) => {
    setSelectedParceiroId(parceiroId);
    setModalVisible(true);
  };

  async function fetchLastHistoricSchedule(): Promise<void> {
    const token = dadosUsuarioData.pessoaDados?.cod_token_pes;
      const cod_paciente = dadosUsuarioData.pessoaDados?.id_pessoa_pes;

      if (!token || !authData.access_token) return;

      try {
        const response = await api.get(
          `/integracao/listHistoricoAgendamentos?token_paciente=${token}&cod_paciente=${cod_paciente}`,
          generateRequestHeader(authData.access_token)
        );

        const data = response.data;
        if (data.length > 0) {
          setLastHistoricSchedule(data[0]);
        }
      } catch (error) {
        console.log('Erro ao buscar histórico mais recente:', error);
      }

  }

  async function fetchParceiros(): Promise<void> {
    try {
      const headers = isLogged && authData.access_token
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
      const headers = isLogged && authData.access_token
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
        setParceirosCredenciados(dataApi.response.data);
      } else {
        console.log('Nenhum parceiro credenciado encontrado');
      }
    } catch (error: any) {
      console.error('Erro ao buscar parceiros credenciados:', error.message);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchParceiros();
      fetchParceirosCredenciados();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (dadosUsuarioData.user.id_usuario_usr && authData.access_token) {
        createNotificationChannel();
        fetchAllData().then(() => {
          showAppointmentReminder(dadosUsuarioData.user.id_usuario_usr.toString());
        });
      }
    }, [dadosUsuarioData, authData]),
  );

  async function fetchSchedules(access_token: string): Promise<void> {
    const token = dadosUsuarioData.pessoaDados?.cod_token_pes!;
    const cod_paciente = dadosUsuarioData.pessoaDados?.id_pessoa_pes;

    return new Promise(async (resolve, reject) => {
      if (userSchedules.length > 0) {
        reject('Já existem dados');
      }

      try {
      const response = await api.get(`/integracao/listAgendamentos?token_paciente=${token}&cod_paciente=${cod_paciente}`, generateRequestHeader(access_token));
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

  const renderCredenciadosItem = ({ item }: { item: Parceiro }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        setSelectedParceiroCredenciadoId(item.id_parceiro_prc);
        setModalCredenciadosVisible(true);
      }}
      style={[styles.credenciadoCard, { backgroundColor: colors.surface }]}>
      <View style={styles.credenciadoContent}>
        <Image
          source={item.img_parceiro_prc ? { uri: `${item.img_parceiro_prc}` } : require('../../assets/images/logonova.png')}
          style={styles.credenciadoImage}
        />
        <View style={styles.credenciadoInfo}>
          <Text variant="titleMedium" style={[styles.credenciadoTitle, { color: colors.onSurface }]}>
            {item.des_nome_fantasia_prc}
          </Text>
          <Text variant="bodySmall" style={[styles.credenciadoLocation, { color: colors.onSurfaceVariant }]}>
            {item.des_municipio_mun}
          </Text>
          <View style={styles.credenciadoBadge}>
            <Text variant="labelSmall" style={styles.credenciadoBadgeText}>
              Credenciado
            </Text>
          </View>
        </View>
        <IconButton 
          icon="chevron-right" 
          size={24} 
          iconColor={colors.onSurfaceVariant} 
          style={styles.credenciadoArrow}
        />
      </View>
    </TouchableOpacity>
  );
};

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
            backgroundColor: '#fff',
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {showTerms ? (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
    {termsLoading ? (
      <View style={[styles.loadingContainer, { backgroundColor: '#f8f9fa' }]}>
        <ActivityIndicator animating={true} size="large" color={colors.primary} />
        <Text style={{ marginTop: 15, color: colors.text, fontSize: 16 }}>Carregando termos...</Text>
      </View>
    ) : termsError ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <IconButton
          icon="alert-circle-outline"
          size={40}
          color={colors.error}
          style={{ marginBottom: 10 }}
        />
        <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16, color: colors.text }}>
          {termsError}
        </Text>
        <Button
          mode="contained"
          onPress={fetchTerms}
          style={{ borderRadius: 8, width: '80%' }}
          labelStyle={{ fontSize: 16 }}
          contentStyle={{ height: 50 }}
        >
          Tentar novamente
        </Button>
      </View>
    ) : (
      <View style={{ flex: 1 }}>
        {/* Header */}
        

        {/* WebView Container */}
        <View style={styles.webViewContainer}>
          <WebView 
            originWhitelist={['*']} 
            source={{ html: generateContractHtml() }} 
            style={{ flex: 1 }}
            injectedJavaScript={`
              document.body.style.background = '#ffffff';
              document.body.style.color = '#333333';
              document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif';
              document.body.style.lineHeight = '1.6';
              document.body.style.padding = '20px';
              true;
            `}
          />
        </View>

        {/* Footer Buttons */}
        <View style={styles.termsFooter}>
          <Button
            mode="contained"
            onPress={acceptTerms}
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: 'white', fontSize: 16, fontWeight: '600' }}
            contentStyle={{ height: 50 }}
          >
            Aceitar e Continuar
          </Button>
          <Text style={styles.footerText}>
            Ao aceitar, você concorda com os termos acima
          </Text>
        </View>
      </View>
    )}
  </SafeAreaView>

      ) : loading ? (
        <LoadingFull title="Carregando..." />
      ) : (
        <ScrollView style={[styles.container]} contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
          {error && <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>{error}</Text>}

          <View style={styles.userInfoResponsive}>
            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>{isLogged ? `Bem vind${dadosUsuarioData.pessoaDados?.des_sexo_biologico_pes === 'M' ? 'o' : 'a'},` : `Bem vindo!`}</Text>
              {isLogged && <Text style={styles.nameText}>{dadosUsuarioData.pessoaDados?.des_genero_pes}!!</Text>}
            </View>

            <Image source={require('../../assets/images/logotransparente.png')} style={styles.responsiveLogo} resizeMode="contain" />
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.corpadrao }]}>
                Nossos Parceiros
              </Text>
              <Button mode="text" compact labelStyle={{ fontSize: 12, color: colors.corpadrao }} onPress={() => navigation.navigate('ParceirosScreen', { partnerType: 'regular' })}>
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
 {/* <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.corpadrao }]}>
                Acesso rápido
              </Text>
              <View style={[styles.titleDecorator, { backgroundColor: colors.corpadrao }]} />
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
          </View> */}
          <View style={styles.sectionContainer}>
  <View style={styles.sectionHeader}>
    <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.corpadrao }]}>
      Nossos Credenciados
    </Text>
    <Button 
      mode="text" 
      compact 
      labelStyle={{ fontSize: 12, color: colors.corpadrao }} 
      onPress={() => navigation.navigate('ParceirosScreen', { partnerType: 'accredited' })}>
      Ver todos
    </Button>
  </View>
  
  {parceirosCredenciados.length > 0 ? (
    <FlatList
      data={parceirosCredenciados}
      renderItem={renderCredenciadosItem}
      keyExtractor={(item) => item.id_parceiro_prc.toString()}
      scrollEnabled={false} // Desativa o scroll para mostrar todos os itens
      contentContainerStyle={styles.credenciadosList}
      ListFooterComponent={<View style={{ height: 10 }} />}
    />
  ) : (
    <Card mode="elevated" style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.emptyCardContent}>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          Nenhum credenciado disponível no momento
        </Text>
      </Card.Content>
    </Card>
  )}
</View>

       
  {/* 
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
          </View> */}

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
            <ProximosAgendamentosDialog
              schedules={userSchedules}
              visible={agendamentosDialogVisible}
              navigation={navigation}
              handlePress={status => {
                setAgendamentosDialogVisible(status);
              }}
            />
          </Portal>

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
        backgroundColor: '#ffffff',

  },
  userInfoResponsive: {
    flexDirection: 'row',
    backgroundColor: '#644086',
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
  sectionContainer: {
    marginTop: 10,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsHeader: {
    backgroundColor: '#3f51b5',
    padding: 25,
    paddingTop: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  webViewContainer: {
    flex: 1,
    margin: 15,
    marginBottom: 0,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  termsFooter: {
    padding: 20,
    paddingTop: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  acceptButton: {
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: '#666',
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
  credenciadosList: {
  paddingTop: 8,
},
credenciadoCard: {
  borderRadius: 12,
  marginBottom: 12,
  elevation: 1,
  overflow: 'hidden',
},
credenciadoContent: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
},
credenciadoImage: {
  width: 60,
  height: 60,
  borderRadius: 8,
  marginRight: 16,
},
credenciadoInfo: {
  flex: 1,
},
credenciadoTitle: {
  fontWeight: '600',
  marginBottom: 4,
},
credenciadoLocation: {
  marginBottom: 8,
},
credenciadoBadge: {
  alignSelf: 'flex-start',
  backgroundColor: '#E3F2FD',
  borderRadius: 4,
  paddingHorizontal: 6,
  paddingVertical: 2,
},
credenciadoBadgeText: {
  color: '#1976D2',
  fontWeight: '500',
},
credenciadoArrow: {
  margin: 0,
  marginLeft: 8,
},
});

export default LoggedHome;