import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccquirePlan } from '../../context/accquirePlanContext';
import { api } from '../../network/api';
import { formatDateToDDMMYYYY, generateRequestHeader, maskBrazilianCurrency } from '../../utils/app-utils';
import { ActivityIndicator, Alert, Clipboard, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { Button, Card, Icon, Text, useTheme } from 'react-native-paper';
import { toast } from 'sonner-native';
import { goBack, navigate } from '../../router/navigationRef';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import LoadingFull from '../../components/loading-full';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ModalContainer from '../../components/modal';
import { ModalContent } from '../../components/modal-content';

export default function PaymentPix() {
  const { authData } = useAuth();
  const { colors } = useTheme();
  const { dadosUsuarioData, setDadosUsuarioData } = useDadosUsuario();
  const [pixResponse, setPixResponse] = useState<PixResponse>();
  // {
  //   id_situacao_cpp: 10,
  //   id_origem_cpp: 5,
  //   vlr_parcela_cpp: 5000,
  //   cod_origem_pagamento_cpp: 309,
  //   id_forma_pagamento_cpp: 10001,
  //   id_origem_pagamento_cpp: 8,
  //   dta_pagamento_cpp: '2025-02-27',
  //   num_cod_externo_cpp: 0,
  //   id_usr_cadastro_cpp: 41,
  //   id_usr_alteracao_cpp: 41,
  //   dth_alteracao_cpp: '2025-02-27T13:17:10.000000Z',
  //   dth_cadastro_cpp: '2025-02-27T13:17:10.000000Z',
  //   id_contrato_parcela_pagamento_cpp: 272,
  //   codigoPagamento: 'or_zPr06dQlHRuy1gjV',
  //   qrcode_url: 'https://api.pagar.me/core/v5/transactions/tran_4QV08JyUWli3XwXA/qrcode?payment_method=pix',
  //   qrcode: 'https://digital.mundipagg.com/pix/',
  // }
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { idFormaPagamento, contratoParcela, contratoCreated } = useAccquirePlan();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  const copyToClipboard = () => {
    Clipboard.setString(pixResponse?.qrcode!);
    setCopied(true);
    toast.success('Codigo copiado!', {
      position: 'bottom-center',
    });
  };

  async function getSignatureDataAfterPixPaid() {
    try {
      const response = await api.get(`/pessoa/${dadosUsuarioData.pessoaDados?.id_pessoa_pes}/signature`, generateRequestHeader(authData.access_token));
      const { data } = response;

      const assinatura = data.response;
      if (response.status == 200) {
        setDadosUsuarioData({
          ...dadosUsuarioData,
          pessoaAssinatura: assinatura,
        });
        toast.success('Dados atualizados com sucesso', { position: 'bottom-center' });
        navigate('user-contracts-payment-successfull');
      }
    } catch (err) {
      console.log('cat err', err);
    }
  }

  async function checkPaid(cod_pagamento: string) {
    console.log('check paid', cod_pagamento);
    const response = await api.get(`/integracaoPagarMe/verificarPagamento?cod_pedido_pgm=${cod_pagamento}`, generateRequestHeader(authData.access_token));
    console.log('response', response.status);
    if (response.status == 200) {
      // navegar para sucesso
      await getSignatureDataAfterPixPaid();
    } else {
      // navegar para falha
      console.log('not paid');
    }
  }

  async function requestPayment() {
    if (!idFormaPagamento) {
      return;
    }

    setLoading(true);

    try {
      let baseData = {
        id_origem_pagamento_cpp: 8,
        cod_origem_pagamento_cpp: contratoParcela?.id_contrato_parcela_config_cpc,
        num_cod_externo_cpp: 0,
        dta_pagamento_cpp: dayjs().format('YYYY-MM-DD'),
        id_origem_cpp: 7,
        id_forma_pagamento_cpp: idFormaPagamento,
      };

      const response = await api.post(`/pagamento-parcela`, baseData, generateRequestHeader(authData.access_token));

      const { data } = response;
      if (response.status == 200) {
        setPixResponse(data.response);
      }
    } catch (err) {
      setErrorMessage('Erro ao realizar checagem de pagamento');
    } finally {
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
    if (contratoParcela) {
      (async () => {
        await requestPayment();
      })();
    }
  }, [contratoParcela]);

  const handleBackButtonPress = async () => {
    await api.delete(`/contrato/${contratoCreated?.id_contrato_ctt}`, generateRequestHeader(authData.access_token));
    goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
    });
  }, [navigation]);

  return (
    <>
      {loading ? (
        <LoadingFull />
      ) : (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ModalContainer handleVisible={() => setIsModalVisible(false)} visible={isModalVisible}>
            <ModalContent
              isBackButtonVisible={true}
              backButtonText="Não"
              confirmButtonText="Sim"
              confirmButtonAction={handleBackButtonPress}
              title="Aviso!"
              description="Deseja cancelar o pagamento?"
              backButtonAction={() => {
                setIsModalVisible(false);
              }}
            />
          </ModalContainer>

          <Card mode="elevated" style={styles.containerCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.containerTitle}>
                Pagamento via Pix
              </Text>

              <Text variant="bodyMedium" style={styles.containerSubtitle}>
                Escaneie o QR Code ou copie o código abaixo para pagar.
              </Text>

              {/* QR Code */}
              <View style={styles.containerQrcode}>
                <Image source={{ uri: pixResponse?.qrcode_url }} style={{ width: 200, height: 200, borderRadius: 10 }} resizeMode="contain" />
              </View>

              {/* Código Pix - Copiar ao tocar */}
              <TouchableOpacity
                onPress={copyToClipboard}
                style={{
                  backgroundColor: colors.surfaceVariant,
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 10,
                }}>
                <Text selectable={true} style={{ textAlign: 'center', fontSize: 14 }}>
                  {pixResponse?.qrcode?.slice(0, 25).concat('...')}
                </Text>
              </TouchableOpacity>

              {/* Valor */}
              <Text variant="bodyMedium" style={{ textAlign: 'center', marginTop: 10 }}>
                Valor: <Text style={{ fontWeight: 'bold' }}>R$ {maskBrazilianCurrency(pixResponse?.vlr_parcela_cpp!)}</Text>
              </Text>

              {/* Vencimento */}
              <Text variant="bodyMedium" style={{ textAlign: 'center', width: '100%' }}>
                Vencimento: <Text style={{ fontWeight: 'bold' }}>{formatDateToDDMMYYYY(pixResponse?.dta_pagamento_cpp!)}</Text>
              </Text>

              {/* Loading Spinner */}
              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <ActivityIndicator animating={true} />
                <Button
                  mode="outlined"
                  key={'goBack'}
                  disabled={loading}
                  onPress={() => setIsModalVisible(true)}
                  labelStyle={{ fontSize: 16 }}
                  style={{ marginTop: 16 }}
                  contentStyle={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Icon source={'arrow-left'} size={18} color={colors.primary} />
                  <Text style={{ color: colors.primary }}> Voltar</Text>
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  containerTitle: { textAlign: 'center', fontWeight: 'bold' },
  containerCard: { width: '100%', maxWidth: 400, padding: 20 },
  containerSubtitle: { textAlign: 'center', marginTop: 8 },
  containerQrcode: { alignItems: 'center', marginVertical: 20 },
});
