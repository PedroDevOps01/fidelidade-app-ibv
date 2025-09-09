import { Alert, BackHandler, Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../network/api';
import { convertExamsLocalsToScheduleRequest, convertStringToNumber, convertToReais, generateRequestHeader, maskBrazilianCurrency } from '../../utils/app-utils';
import { useEffect, useRef, useState } from 'react';
import { initialScheduleRequestState, useExames } from '../../context/exames-context';
import LoadingFull from '../../components/loading-full';
import ProcedureError from '../user-procedure-details-screen/procedure-error';
import ExamsLocalsCard from './exams-local-card';
import { RefreshControl } from 'react-native-gesture-handler';
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

  // Busca os locais sempre que um exame é selecionado
  useEffect(() => {
    if (selectedExams.length > 0) {
      // extrai todos os ids dos exames selecionados
      const procedimentosArray = selectedExams.map(exam => exam.id_procedimento_tpr);
      fetchExamsLocals(procedimentosArray);
    } else {
      setLocals([]);
    }
  }, [selectedExams]);

  async function fetchExamsLocals(procedimentosArray: number[]) {
    console.log('Fetching exams locals for IDs:', procedimentosArray);
    setLoading(true);

    try {
      const url = `integracao/listUnidadeProcedimentoExame`;

      const response = await api.get(url, {
        ...generateRequestHeader(authData.access_token),
        params: { procedimentos_array: procedimentosArray },
      });

      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.status === 200) {
        const localsWithGroup = response.data.map(local => ({
          ...local,
          procedimentos: local.procedimentos.map((proc, index) => {
            // Associa des_grupo_tpr com base no índice, assumindo que a API retorna na mesma ordem
            const selectedExam = selectedExams[index] || null;
            console.log('Matching proc:', {
              proc,
              selectedExam,
              index,
              procedimentosArray,
            });
            return {
              ...proc,
              des_grupo_tpr: selectedExam?.des_grupo_tpr || 'Grupo não encontrado',
            };
          }),
        }));

        // Ordena os locais pelo menor valor (considerando particular ou assinante)
       

          const sortedLocals = localsWithGroup.sort((a, b) => {
  const priceA = setValuePrices(a.procedimentos);
  const priceB = setValuePrices(b.procedimentos);

  // pega sempre o menor valor entre particular e assinante para comparar
  const minA = Math.min(priceA.vlr_particular || Infinity, priceA.vlr_assinante || Infinity);
  const minB = Math.min(priceB.vlr_particular || Infinity, priceB.vlr_assinante || Infinity);

  return minA - minB;
});

setLocals(sortedLocals);
      } else {
        Alert.alert('Aviso', 'Não foi possível carregar os locais.');
      }
    } catch (err: any) {
      console.error('Error:', err);
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
    if (typeProcedure === 'assinante' && !dadosUsuarioData.pessoaAssinatura?.assinatura_liberada) {
      Alert.alert(
        'Torne-se um Assinante!',
        'Não é assinante? Venha agora e aproveite descontos exclusivos para agendar seus exames com preços especiais!',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Assinar Agora',
            onPress: () => navigate('user-contracts-stack'), // Redirect to "Meu Plano" screen
            style: 'default',
          },
        ],
        { cancelable: true },
      );
      return;
    }

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
          cod_procedimento: convertStringToNumber(typeProcedure === 'assinante' ? e.cod_procedimento_assinatura : e.cod_procedimento_particular),
          vlr_procedimento: convertStringToNumber(typeProcedure === 'assinante' ? e.valor_assinatura : e.valor_particular),
        })),
      };

      setScheduleRequestData(dataToContext);
      navigate('user-exams-select-date', { item: currentItem });
    }
  }

  useEffect(() => {
    if (currentItem && prices) {
      bottomSheetRef.current?.expand();
    }
  }, [prices, currentItem]);

  return (
    <>
      {loading ? (
        <LoadingFull />
      ) : (
        
        <View style={[styles.container, { backgroundColor: colors.fundo }]}>
          {locals.length > 0 ? (
            
           <FlatList
  data={locals}
  renderItem={({ item }) => (
    <ExamsLocalsCard data={item} onPress={onCardPress} />
  )}
  contentContainerStyle={styles.listContent}
  ListHeaderComponent={
     <View style={{ flexDirection: 'row', gap: 0 }}>
            {[1, 2, 3].map((_, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: 6,
                  marginRight: 20,
                  marginTop:12,
                  marginLeft: 20,
                  borderRadius: 5,
                  backgroundColor: index < 1 ? colors.primary : colors.onSecondary,
                }}
              />
            ))}
          </View>
  }
  refreshControl={
    <RefreshControl
      refreshing={loading}
      onRefresh={() => {
        if (selectedExams.length > 0) {
          const procedimentosArray = selectedExams.map(
            exam => exam.id_procedimento_tpr
          );
          fetchExamsLocals(procedimentosArray);
        }
      }}
      colors={[colors.primary]}
      tintColor={colors.primary}
    />
  }
  removeClippedSubviews={false}
  ItemSeparatorComponent={() => <View style={styles.separator} />}
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
            snapPoints={['38%']}
            enablePanDownToClose
            handleIndicatorStyle={{
              backgroundColor: colors.primary,
              width: 40,
              height: 4,
            }}
            backgroundStyle={{ backgroundColor: colors.surface }}
            handleStyle={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 16,
            }}>
            <BottomSheetView style={[styles.bottomSheetContainer, { backgroundColor: colors.surface }]}>
              {prices ? (
                <View style={styles.bottomSheetContent}>
                  <Text variant="titleMedium" style={[styles.bottomSheetTitle, { color: colors.onSurface }]}>
                    Selecione o tipo de atendimento
                  </Text>

                  <Button
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    mode="contained"
                    labelStyle={styles.buttonLabel}
                    onPress={() => onTypeSelect(prices?.vlr_assinante as number, 'assinante')}>
                    {`Assinante: ${maskBrazilianCurrency(prices?.vlr_assinante as number)}`}
                  </Button>

                  <Button
                    style={[styles.button, { borderColor: colors.outline }]}
                    mode="outlined"
                    labelStyle={[styles.buttonLabel, { color: colors.onSurface }]}
                    onPress={() => onTypeSelect(prices?.vlr_particular as number, 'particular')}>
                    {`Particular: ${maskBrazilianCurrency(prices?.vlr_particular as number)}`}
                  </Button>
                </View>
              ) : null}
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
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 15,
  },
  separator: {
    height: 12,
  },
  bottomSheetContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  bottomSheetContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomSheetTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  button: {
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 8,
    elevation: 0,
  },
  subscriberButton: {
    marginTop: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 4,
  },
});
