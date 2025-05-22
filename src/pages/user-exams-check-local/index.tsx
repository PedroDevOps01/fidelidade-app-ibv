import { Alert, BackHandler, Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../network/api';
import { convertExamsLocalsToScheduleRequest, convertStringToNumber, convertToReais, generateRequestHeader, maskBrazilianCurrency } from '../../utils/app-utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { initialScheduleRequestState, useExames } from '../../context/exames-context';
import LoadingFull from '../../components/loading-full';
import ProcedureError from '../user-procedure-details-screen/procedure-error';
import ExamsLocalsCard from './exams-local-card';
import { RefreshControl, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { useFocusEffect } from '@react-navigation/native';
import { navigate } from '../../router/navigationRef';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React from 'react';
import CustomBackdrop from '../../components/custom-backdrop-component';

type valueTypes = {
  vlr_particular: number;
  vlr_assinante: number;
};

export default function UserExamsCheckLocal() {
  const { authData } = useAuth();
  const { colors } = useTheme();
  const { selectedExams, setScheduleRequestData, scheduleRequest } = useExames();
  const { dadosUsuarioData } = useDadosUsuario();

  const [loading, setLoading] = useState<boolean>(false);
  const [locals, setLocals] = useState<ExamsLocals[]>([]);
  const [prices, setPrices] = useState<valueTypes>();
  const [currentItem, setCurrentItem] = useState<ExamsLocals>();
  const bottomSheetRef = useRef<BottomSheet>(null);

  useFocusEffect(() => {
    const backAction = () => {
      setScheduleRequestData(initialScheduleRequestState);
      return null;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  });

  const examsQuery = useMemo(() => {
    return selectedExams.map(item => `procedimentos_array[]=${item}`).join('&');
  }, [selectedExams]);

  async function fetchExamsLocals() {
    setLoading(true);
    const examsArray = selectedExams.map(item => `procedimentos_array[]=${item.cod_procedimento}`).join('&');

    try {
      console.log(`integracao/listUnidadeProcedimentoExame?${examsArray}`);
      const response = await api.get(`integracao/listUnidadeProcedimentoExame?${examsArray}`, generateRequestHeader(authData.access_token));

      if (response.status === 200) {
        setLocals(response.data);
      }
    } catch (err: any) {
      Alert.alert('Aviso', 'Erro ao buscar dados. Tente novamente');
    } finally {
      setLoading(false);
    }
  }

  function setValuePrices(items: ExamsLocalsProcedure[]) {
    const result = items.reduce(
      (acc, curr) => {
        const valorParticular = convertStringToNumber(curr.valor_particular) || 0;
        const valorAssinatura = convertStringToNumber(curr.valor_assinatura) || 0;

        acc.vlr_particular += valorParticular;
        acc.vlr_assinante += valorAssinatura;

        return acc;
      },
      { vlr_particular: 0, vlr_assinante: 0 },
    );
    return result;
  }

  const onCardPress = (item: ExamsLocals) => {
    setPrices(setValuePrices(item.procedimentos));
    setCurrentItem(item);
  };

  function onTypeSelect(vlr_total: number, typeProcedure: 'particular' | 'assinante') {
    // if (!dadosUsuarioData.pessoaAssinatura?.assinatura_liberada) {
    //   navigate('user-payment-attempt-screen');
    //   return;
    // }

    if (currentItem) {
      let convertedData: ScheduleRequest = convertExamsLocalsToScheduleRequest(
        currentItem!,
        dadosUsuarioData.pessoaDados?.id_pessoa_pes!,
        '',
        dadosUsuarioData.pessoaDados?.cod_token_pes!,
      );

      let dataToContext: ScheduleRequest = {
        ...convertedData,
        vlr_total,
        procedimentos_array: currentItem!.procedimentos.map(e => ({
          cod_procedimento: convertStringToNumber(typeProcedure == 'assinante' ? e.cod_procedimento_assinatura : e.cod_procedimento_particular),
          vlr_procedimento: convertStringToNumber(typeProcedure == 'assinante' ? e.valor_assinatura : e.valor_particular),
        })),
      };

      setScheduleRequestData(dataToContext);

      //console.log(JSON.stringify(currentItem, null, 2));

      navigate('user-exams-select-date', { item: currentItem });
    }
  }

  useEffect(() => {
    if (currentItem && prices) {
      bottomSheetRef.current?.expand();
    }
  }, [prices, currentItem]);

  useEffect(() => {
    fetchExamsLocals();
  }, [examsQuery]);

  return (
    <>
      {loading ? (
        <LoadingFull />
      ) : (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {locals.length > 0 ? (
            <FlatList
              data={locals}
              renderItem={({ item }) => <ExamsLocalsCard data={item} onPress={onCardPress} />}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchExamsLocals()} />}
              removeClippedSubviews={false}
            />
          ) : (
            <ProcedureError
              icon="alert-circle"
              title="Nenhum Local Disponível"
              body="Infelizmente, não há locais para os procedimentos selecionados no momento. Tente novamente mais tarde."
            />
          )}
          <BottomSheet
            backdropComponent={CustomBackdrop}
            ref={bottomSheetRef}
            index={-1}
            snapPoints={['40%']}
            enablePanDownToClose
            handleIndicatorStyle={{ backgroundColor: colors.primary }}
            handleStyle={{
              backgroundColor: colors.surfaceVariant,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
            }}>
            <BottomSheetView style={[styles.bottomSheetContainer, { backgroundColor: colors.surfaceVariant }]}>
              {prices ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Button
                    disabled={!dadosUsuarioData.pessoaAssinatura?.assinatura_liberada}
                    key={'1'}
                    style={{ marginBottom: 20 }}
                    mode="contained"
                    onPress={() => onTypeSelect(prices?.vlr_assinante as number, 'assinante')}>
                    {`Continuar como assinante: ${maskBrazilianCurrency(prices?.vlr_assinante as number)}`}
                  </Button>

                  <Button mode="outlined" onPress={() => onTypeSelect(prices?.vlr_particular as number, 'particular')}>
                    {`Continuar como particular: ${maskBrazilianCurrency(prices?.vlr_assinante as number)}`}
                  </Button>
                </View>
              ) : (
                <></>
              )}
            </BottomSheetView>
          </BottomSheet>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSheetContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  bottomSheetButton: {
    width: Dimensions.get('screen').width - 20,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});
