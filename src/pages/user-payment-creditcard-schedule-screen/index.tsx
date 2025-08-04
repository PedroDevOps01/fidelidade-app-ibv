import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import LoadingFull from '../../components/loading-full';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import UserCreditCard from '../user-create-credit-card/user-credit-card';
import { navigate } from '../../router/navigationRef';
import { generateRequestHeader, getCurrentDate, maskBrazilianCurrency } from '../../utils/app-utils';
import { useConsultas } from '../../context/consultas-context';

export default function UserPaymentCreditCardScheduleScreen() {
  const route = useRoute();
  const { colors } = useTheme();
  const { authData } = useAuth();
  const { dadosUsuarioData } = useDadosUsuario();
  const { width } = useWindowDimensions();
  const { currentProcedureMethod } = useConsultas()
  const ref = React.useRef<ICarouselInstance>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingPayment, setLoadingPayment] = useState<boolean>(false);

  const [userCreditCards, setUserCreditCards] = useState<UserCreditCard[]>([]);
  const [currentCCIndex, setCurrentCCIndex] = useState<number>(0);

  const payload: ScheduleRequest = route.params as ScheduleRequest;

  const handlePrev = () => {
    if (ref.current && currentCCIndex > 0) {
      ref.current.scrollTo({ index: currentCCIndex - 1, animated: true });
      setCurrentCCIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (ref.current && currentCCIndex < userCreditCards.length - 1) {
      ref.current.scrollTo({ index: currentCCIndex + 1, animated: true });
      setCurrentCCIndex(prev => prev + 1);
    }
  };

  const fetchCreditCards = async (idPessoaPes: number) => {
    console.log('idPessoaPes', idPessoaPes);
    setLoading(true);
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
        setUserCreditCards(data.data);
      }
    } catch (err: any) {
      Alert.alert('Aviso', 'Erro ao carregar cartões. Tente novamente mais tarde');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCreditCards(dadosUsuarioData.pessoaDados?.id_pessoa_pes!);
    }, [dadosUsuarioData, authData]),
  );

  async function payWithCreditCard(payload: any) {


    setLoadingPayment(true);
    
    //console.log(currentProcedureMethod === 'exame' ? '/integracao/gravarAgendamentoExame' : '/integracao/gravarAgendamento')
    
    
    
    try {
      const response = await api.post(
        currentProcedureMethod === 'exame' ? '/integracao/gravarAgendamentoExame' : '/integracao/gravarAgendamento',
        {
          ...payload,
          card_id: userCreditCards[currentCCIndex].id,
        },
        generateRequestHeader(authData.access_token),
      );

      if (response.status == 200) {
        navigate('user-payment-successfull-screen', { reset: true, name: 'user-schedules-screen' });
      }
    } catch (err: any) {
      Alert.alert('Aviso', 'Erro ao realizar pagamento. Tente novamente.')
      console.log(JSON.stringify(err, null, 2));
    } finally {
      setLoadingPayment(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <ScrollView>
          {userCreditCards?.length > 0  ? (
            <View>
              <Text variant="headlineMedium" style={[styles.headText, { color: colors.primary }]}>
                Selecione um cartão
              </Text>
              <Carousel
                ref={ref}
                data={userCreditCards}
                width={width}
                height={200}
                defaultIndex={currentCCIndex}
                onSnapToItem={index => {
                  setCurrentCCIndex(index);
                }}
                renderItem={({ item }) => (
                  <View style={{ width: width - 32, height: 200 }}>
                    <UserCreditCard
                      brand={item.brand}
                      exp_month={String(item.exp_month)}
                      exp_year={String(item.exp_year)}
                      holder_name={String(item.holder_name)}
                      number={`${item.first_six_digits}******${item.last_four_digits}`}
                    />
                    <TouchableOpacity style={styles.buttonLeft} onPress={handlePrev}>
                      <Text style={styles.buttonText}>◀</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonRight} onPress={handleNext}>
                      <Text style={styles.buttonText}>▶</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />

              <View style={{ marginVertical: 16, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: colors.primary,
                    letterSpacing: 1,
                  }}>
                  {`Valor: 1x de R$: ${maskBrazilianCurrency(payload.vlr_procedimento! ?? payload.vlr_total!)}`}
                </Text>
              </View>
              <Button
                disabled={loadingPayment}
                key={loadingPayment ? 'enabled' : 'disabled'}
                onPress={() => {
                  payWithCreditCard(route.params);
                }}
                mode="contained">
                {loadingPayment ? 'Aguarde...' : 'Pagar'}
              </Button>
            </View>
          ) : (
            <View style={[styles.containerErrorComponent, { backgroundColor: colors.background }]}>
              <IconButton icon="credit-card-off-outline" size={64} iconColor={colors.primary} style={styles.icon} />
              <Text variant="headlineMedium" style={styles.text}>
                Você não possui nenhum cartão cadastrado!
              </Text>
              <Button
                key={'create-credit-card'}
                mode='contained'
                style={{ marginTop: 10, width: '100%'}}
                onPress={() => {
                  navigate('user-create-credit-card-screen');
                }}>
                Cadastrar cartão
              </Button>
            </View>
          )}
        </ScrollView>
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
  buttonLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    padding: 10,
    borderRadius: 50,
  },
  buttonRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    padding: 10,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    top: -10,
  },
  headText: {
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginVertical: 16,
  },
  containerErrorComponent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginBottom: 16,
  },
});
