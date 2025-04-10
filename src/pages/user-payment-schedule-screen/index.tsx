import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Image, Clipboard, Alert, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { generateRequestHeader, getCurrentDate, maskBrazilianCurrency } from '../../utils/app-utils';
import { api } from '../../network/api';
import { useAuth } from '../../context/AuthContext';
import LoadingFull from '../../components/loading-full';
import { goBack, navigate } from '../../router/navigationRef';
import { useConsultas } from '../../context/consultas-context';
import CustomToast from '../../components/custom-toast';

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
  const { currentProcedureMethod } = useConsultas();
  const [loading, setLoading] = useState<boolean>(true);
  const [pixResponse, setPixResponse] = useState<PixScheduleResponse>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = (code: string) => {
    Clipboard.setString(code);
  };

  async function fetchPayment(payload: any) {
    setLoading(true);
    try {
      const response = await api.post(
        currentProcedureMethod === 'exame' ? '/integracao/gravarAgendamentoExame' : '/integracao/gravarAgendamento',
        payload,
        generateRequestHeader(authData.access_token),
      );

      if (response.data.error) {
        goBack();
        CustomToast(response.data.error, colors);
        return;
      }

      setPixResponse(response.data);
    } catch (err: any) {
      goBack();
      CustomToast('Erro ao realizar pagamento. Tente novamente mais tarde', colors);
    } finally {
      setLoading(false);
    }
  }

  async function checkPaid(cod_pagamento: string) {
    try {
      console.log('teste', cod_pagamento);

      const response = await api.get(`/integracaoPagarMe/verificarPagamento?cod_pedido_pgm=${cod_pagamento}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      if (response.status == 200) {
        //console.log(JSON.stringify(response.data, null, 2))
        console.log(response.data.response[0].des_status_pgm);

        if (response.data.response[0].des_status_pgm === 'paid') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          navigate('user-payment-successfull-screen', { reset: true, name: 'user-schedules-screen' });
        }
      }
    } catch (err: any) {}
  }

  useEffect(() => {
    if (pixResponse?.data.qrcode_url) {
      intervalRef.current = setInterval(() => {
        if (pixResponse!.data.codigoPagamento) checkPaid(pixResponse!.data.codigoPagamento); // Executa a função a cada 20 segundos
      }, 20000);
    }
  }, [pixResponse]);

  useEffect(() => {
    (async () => {
      console.log(JSON.stringify(route.params, null, 2));
      await fetchPayment(route.params!);
    })();
  }, [route]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <ScrollView>
          <Card mode="contained" style={styles.card}>
            <Card.Title title="Pagamento via Pix" titleStyle={{ textAlign: 'center', fontWeight: 'bold' }} titleVariant="headlineMedium" />
            <Card.Content>
              <Text style={styles.text}>Valor:</Text>
              <Text style={styles.value}>R$: {maskBrazilianCurrency(route.params!.vlr_total ?? 0)}</Text>

              <View style={styles.qrContainer}>
                <Text style={styles.text}>Escaneie o QR Code:</Text>
                <Image source={{ uri: pixResponse?.data.qrcode_url }} style={styles.qrCode} resizeMode="contain" />
              </View>
              <Button mode="contained" style={{ marginTop: 10 }} onPress={() => copyToClipboard(pixResponse!.data.qrcode!)}>
                Copiar código
              </Button>
            </Card.Content>
          </Card>

          <Text variant="bodyLarge">
            O pagamento via Pix gerado para esta transação possui um prazo de validade de 30 minutos. Após esse período, o QR Code expira e não poderá ser utilizado para concluir o
            pagamento.
          </Text>
          <Text> </Text>
          <Text variant="bodyLarge">
            Assim que o pagamento via Pix for realizado, a tela será atualizada automaticamente para refletir o status da transação. Por favor, aguarde alguns instantes após a
            conclusão do pagamento. Caso o status não seja atualizado, verifique sua conexão com a internet ou entre em contato com o suporte.
          </Text>
          <ActivityIndicator style={{ marginTop: 10 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 8,
  },
  qrContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
    marginTop: 8,
  },
  button: {
    marginTop: 16,
  },
});
