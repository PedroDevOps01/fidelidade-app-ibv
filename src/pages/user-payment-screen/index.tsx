import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Image, Clipboard} from 'react-native';
import {Text, Card, Button, useTheme, ActivityIndicator} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';
import {generateRequestHeader, getCurrentDate, maskBrazilianCurrency} from '../../utils/app-utils';
import {api} from '../../network/api';
import {useAuth} from '../../context/AuthContext';
import LoadingFull from '../../components/loading-full';
import {navigate} from '../../router/navigationRef';

export default function UserPaymentScreen() {
  const route = useRoute();
  const {colors} = useTheme();
  const {authData} = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [pixResponse, setPixResponse] = useState<PixResponse>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);


  const copyToClipboard = (code: string) => {
    Clipboard.setString(code);
  };

  async function fetchPayment(payload: any) {
    setLoading(true);
    try {
      const response = await api.post(
        '/pagamento-parcela',
        {
          id_origem_pagamento_cpp: 8,
          cod_origem_pagamento_cpp: payload.item.id_contrato_parcela_config_cpc,
          num_cod_externo_cpp: 0,
          id_forma_pagamento_cpp: payload.formaPagamento.id_forma_pagamento_fmp,
          dta_pagamento_cpp: getCurrentDate(),
          id_origem_cpp: 8,
        },
        generateRequestHeader(authData.access_token)
      );

      setPixResponse(response.data.response);
    } catch (err: any) {
      console.log(err);
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
          navigate('user-payment-successfull-screen');
        }
      }
    } catch (err: any) {}
  }

  useEffect(() => {
    if (pixResponse?.qrcode_url) {
      intervalRef.current = setInterval(() => {
        if (pixResponse!.codigoPagamento) checkPaid(pixResponse!.codigoPagamento); // Executa a função a cada 20 segundos
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

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <>
          <Card mode="contained" style={styles.card}>
            <Card.Title
              title="Pagamento via Pix"
              titleStyle={{textAlign: 'center', fontWeight: 'bold'}}
              titleVariant="headlineMedium"
            />
            <Card.Content>
              <Text style={styles.text}>Valor da Parcela:</Text>
              <Text style={styles.value}>R$: {maskBrazilianCurrency(pixResponse!.vlr_parcela_cpp ?? 0)}</Text>

              <View style={styles.qrContainer}>
                <Text style={styles.text}>Escaneie o QR Code:</Text>
                <Image source={{uri: pixResponse!.qrcode_url}} style={styles.qrCode} resizeMode="contain" />
              </View>
              <Button mode='contained' style={{marginTop: 10}} onPress={() => copyToClipboard(pixResponse!.qrcode!)}>Copiar código</Button>
            </Card.Content>
          </Card>

          <Text variant="bodyLarge">
            O pagamento via Pix gerado para esta transação possui um prazo de validade de 30 minutos. Após esse período,
            o QR Code expira e não poderá ser utilizado para concluir o pagamento.
          </Text>
          <Text> </Text>
          <Text variant="bodyLarge">
            Assim que o pagamento via Pix for realizado, a tela será atualizada automaticamente para refletir o status
            da transação. Por favor, aguarde alguns instantes após a conclusão do pagamento. Caso o status não seja
            atualizado, verifique sua conexão com a internet ou entre em contato com o suporte.
          </Text>
          <ActivityIndicator style={{marginTop: 10}} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,

    justifyContent: 'center',
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
