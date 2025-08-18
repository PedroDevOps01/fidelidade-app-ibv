import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Image, Clipboard, Alert, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, IconButton, Chip } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { generateRequestHeader, getCurrentDate, maskBrazilianCurrency } from '../../utils/app-utils';
import { api } from '../../network/api';
import { useAuth } from '../../context/AuthContext';
import LoadingFull from '../../components/loading-full';
import { goBack, navigate } from '../../router/navigationRef';
import { useConsultas } from '../../context/consultas-context';
import CustomToast from '../../components/custom-toast';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useExames } from '../../context/exames-context';

interface PixScheduleResponse {
  message: string;
  data: {
    agenda_exames_id: string;
    codigoPagamento: string;
    qrcode_url: string;
    qrcode: string;
  };
}

export default function UserPaymentScheduleScreen() {
  const route = useRoute();
  const { colors } = useTheme();
  const { authData } = useAuth();
  const { scheduleRequest } = useExames();

  const { currentProcedureMethod } = useConsultas();
  const [loading, setLoading] = useState<boolean>(true);
  const [pixResponse, setPixResponse] = useState<PixScheduleResponse>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = (code: string) => {
    Clipboard.setString(code);
    CustomToast('Código copiado!', colors);
  };

  async function fetchPayment(payload: any) {
  setLoading(true);
  try {
    const response = await api.post(
      currentProcedureMethod === 'exame' 
        ? '/integracao/gravarAgendamentoExame'
        : '/integracao/gravarAgendamento',
      currentProcedureMethod === 'exame' ? scheduleRequest : payload, // decide qual payload usar
      generateRequestHeader(authData.access_token),
    );

    setPixResponse(response.data);
    console.log('Pix payment response:', response.data);
  } catch (err) {
    console.log(err);
    goBack();
    CustomToast('Erro ao realizar pagamento. Tente novamente mais tarde', colors);
  } finally {
    setLoading(false);
  }
}


  async function checkPaid(cod_pagamento: string) {
  try {
    const response = await api.get(`/integracaoPagarMe/verificarPagamento?cod_pedido_pgm=${cod_pagamento}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `bearer ${authData.access_token}`,
      },
    });

    console.log('Resposta do verificarPagamento:', response.data); // <-- log da resposta completa

    if (response.status == 200) {
      const status = response.data.response[0]?.des_status_pgm;
      console.log('Status do pagamento:', status); // <-- log do status

      if (status === 'failed') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        navigate('user-payment-failed-screen');
      }

      if (status === 'paid') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        navigate('user-payment-successfull-screen', { reset: true, name: 'user-schedules-screen' });
      }
    }
  } catch (err: any) {
    console.log('Erro ao verificar pagamento:', err); // <-- log de erro da requisição
  }
}

  useEffect(() => {
    if (pixResponse?.data.qrcode_url) {
      intervalRef.current = setInterval(() => {
        if (pixResponse!.data.codigoPagamento) checkPaid(pixResponse!.data.codigoPagamento);
      }, 20000);
    }
  }, [pixResponse]);

  useEffect(() => {
    (async () => {
      await fetchPayment(route.params!);
    })();
  }, [route]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  });

  function getTotalValue() {
    if (route.params && route.params.vlr_total) {
      return route.params.vlr_total; 
    }
    else if (route.params && route.params.vlr_procedimento) {
      return route.params.vlr_procedimento; 
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Card mode="elevated" style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Title
              title="Pagamento via Pix"
              titleStyle={[styles.title, { color: colors.primary }]}
              subtitle="Pagamento instantâneo e seguro"
              subtitleStyle={{ color: colors.onSurfaceVariant }}
              left={(props) => <MaterialCommunityIcons {...props} name="qrcode-scan" size={24} color={colors.primary} />}
            />
            
            <Card.Content style={styles.content}>
              <View style={styles.valueContainer}>
                <Text variant="bodyMedium" style={[styles.label, { color: colors.onSurface }]}>
                  Valor total:
                </Text>
                <Text variant="headlineMedium" style={[styles.value, { color: colors.primary }]}>
                  {maskBrazilianCurrency(getTotalValue())}
                </Text>
              </View>

              <View style={styles.qrContainer}>
                <Chip
                  icon="information-outline"
                  mode="outlined"
                  style={[styles.chip, { borderColor: colors.primaryContainer }]}
                  textStyle={{ color: colors.onSurface }}
                >
                  Escaneie o QR Code
                </Chip>
                
                <View style={[styles.qrBorder, { borderColor: colors.primaryContainer }]}>
                  <Image 
                    source={{ uri: pixResponse?.data.qrcode_url }} 
                    style={styles.qrCode} 
                    resizeMode="contain" 
                  />
                </View>
              </View>
              
              <Button
                mode="contained-tonal"
                icon="content-copy"
                onPress={() => copyToClipboard(pixResponse!.data.qrcode!)}
                style={[styles.copyButton, { backgroundColor: colors.primaryContainer }]}
                labelStyle={[styles.buttonLabel, { color: colors.onPrimaryContainer }]}
              >
                Copiar código Pix
              </Button>
            </Card.Content>
          </Card>

          <Card mode="elevated" style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.infoSection}>
                <MaterialCommunityIcons name="timer-outline" size={20} color={colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={[styles.infoText, { color: colors.onSurface }]}>
                  Prazo de validade: 30 minutos
                </Text>
              </View>
              
              <View style={styles.infoSection}>
                <MaterialCommunityIcons name="autorenew" size={20} color={colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={[styles.infoText, { color: colors.onSurface }]}>
                  Atualização automática do status
                </Text>
              </View>
              
              <View style={styles.infoSection}>
                <MaterialCommunityIcons name="information-outline" size={20} color={colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={[styles.infoText, { color: colors.onSurface }]}>
                  Não feche o aplicativo durante o pagamento
                </Text>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="bodyMedium" style={[styles.statusText, { color: colors.onSurface }]}>
              Aguardando confirmação do pagamento...
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontWeight: '800',
    fontSize: 22,
    marginLeft: -8,
  },
  content: {
    paddingVertical: 16,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontWeight: '800',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chip: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  qrBorder: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  qrCode: {
    width: 220,
    height: 220,
  },
  copyButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  buttonLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  infoCard: {
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusText: {
    marginTop: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});