import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Image, Clipboard} from 'react-native';
import {Text, Card, Button, useTheme, ActivityIndicator} from 'react-native-paper';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {generateRequestHeader, getCurrentDate, maskBrazilianCurrency} from '../../utils/app-utils';
import {api} from '../../network/api';
import {useAuth} from '../../context/AuthContext';
import LoadingFull from '../../components/loading-full';
import {navigate} from '../../router/navigationRef';
import { toast } from 'sonner-native';

export default function UserPaymentScreen() {
  const route = useRoute();
  const {colors} = useTheme();
  const {authData} = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [pixResponse, setPixResponse] = useState<PixResponse>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [errorMessage, setErrorMessage] = useState<string>('');


  const copyToClipboard = () => {
      Clipboard.setString(pixResponse?.qrcode!);
      toast.success('Codigo copiado!', {
        position: 'bottom-center',
      });
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
    setErrorMessage('')
    const response = await api.get(`/integracaoPagarMe/verificarPagamento?cod_pedido_pgm=${cod_pagamento}`, generateRequestHeader(authData.access_token));
    
    //log('response', response.data.response);
    if (response.status == 200) {
      const { data } = response; 


      if (data.response[0].des_status_pgm == 'paid') {
        //await getSignatureDataAfterPixPaid();
        return
      }
  

      if (data.response[0].des_status_pgm == 'failed') {
        //navigate('user-contracts-payment-failed');
        return
      }


      if (data.response[0].des_status_pgm == 'pending') {
        console.log('pending');
      }

    } else {
      // navegar para falha
      setErrorMessage('Erro ao verificar pagamento');
      setLoading(false);
    }
  }

  useFocusEffect(
      useCallback(() => {
        const interval = setInterval(() => {
          checkPaid(pixResponse?.codigoPagamento!);
        }, 20000);
        return () => clearInterval(interval);
      }, [pixResponse?.codigoPagamento, checkPaid]),
    );





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
              <Text style={styles.value}>{maskBrazilianCurrency(pixResponse!.vlr_parcela_cpp ?? 0)}</Text>

              <View style={styles.qrContainer}>
                <Text style={styles.text}>Escaneie o QR Code:</Text>
                <Image source={{uri: pixResponse!.qrcode_url}} style={styles.qrCode} resizeMode="contain" />
              </View>
              <Button mode='contained' style={{marginTop: 10}} onPress={() => copyToClipboard()}>Copiar código</Button>
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
