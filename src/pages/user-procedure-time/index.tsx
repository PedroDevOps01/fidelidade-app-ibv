import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, unstable_batchedUpdates, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Searchbar, Text, useTheme } from 'react-native-paper';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../network/api';
import LoadingFull from '../../components/loading-full';
import TimeCardComponent from './time-card-component';
import ProcedureError from '../user-procedure-details-screen/procedure-error';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { convertStringToNumber, formatDateToDDMMYYYY, formatTimeToHHMM } from '../../utils/app-utils';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { useConsultas } from '../../context/consultas-context';
import { navigate } from '../../router/navigationRef';
import React from 'react';

interface UserProcedureTimeProps {
  navigation: any;
  route: any;
}

export default function UserProcedureTime({ navigation, route }: UserProcedureTimeProps) {
  const { authData } = useAuth();
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();
  const { procedureTimeDetailsData } = useConsultas();

  const [loading, setLoading] = useState<boolean>(false);
  const [procedureTimeDetails, setProcedureTimeDetails] = useState<ProcedureTimeContainer>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [queryObj, setQueryObj] = useState<{
    cod_procedimento: string;
    cod_empresa: string;
    cod_profissional: string;
  }>();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const openBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  useEffect(() => {
    openBottomSheet();
  }, [procedureTimeDetailsData.procedureTimeDetails]);

  async function fetchDatasAndTimeByProcedure(cod_procedimento: string, cod_empresa: string, cod_profissional: string) {
    const url = cod_profissional
      ? `/integracao/listProfissionaisHorariosUnidade?cod_procedimento=${cod_procedimento}&cod_empresa=${cod_empresa}&cod_profissional=${cod_profissional}`
      : `/integracao/listHorariosUnidade?cod_procedimento=${cod_procedimento}&cod_empresa=${cod_empresa}`;

    setLoading(true);

    try {
      const response = await api.get(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      const { data } = response;

      setProcedureTimeDetails(data);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    //console.log(JSON.stringify(route.params, null, 2));
    navigation.setOptions({ title: route.params.procedimento.empresa });

    (async () => {
      const cod_procedimento = route.params.procedimento.cod_procedimento;
      const cod_empresa = route.params.procedimento.cod_empresa;
      const cod_profissional = route.params.procedimento.cod_profissional;
      setQueryObj({
        cod_procedimento,
        cod_empresa,
        cod_profissional,
      });

      fetchDatasAndTimeByProcedure(cod_procedimento, cod_empresa, cod_profissional);
    })();
  }, [navigation]);

  const data = procedureTimeDetails
    ? Object.entries(procedureTimeDetails).reduce((acc, [date, procedures]) => {
        // Verifica se a data ou nome do profissional corresponde à pesquisa
        if (
          date.includes(searchQuery) || // Filtra pela data
          procedures.some(proc => proc.nome_profissional.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          // Filtra apenas os procedimentos que correspondem ao nome do profissional
          const filteredProcedures = procedures.filter(proc =>
            proc.nome_profissional.toLowerCase().includes(searchQuery.toLowerCase()),
          );
          // Se houver procedimentos correspondentes, adiciona à lista
          if (filteredProcedures.length > 0) {
            acc[date] = filteredProcedures;
          }
        }
        return acc;
      }, {})
    : procedureTimeDetails;

  const onRefresh = async () => {
    await fetchDatasAndTimeByProcedure(
      queryObj?.cod_procedimento!,
      queryObj?.cod_empresa!,
      queryObj?.cod_profissional!,
    );
  };

  //assinante: true / particular: false
  const getScheduleRequestData = (assinante: boolean) => {
    const { procedureTimeDetails } = procedureTimeDetailsData;

    //console.log(JSON.stringify(procedureTimeDetails, null, 2))
    let data_agenda = Object.keys(procedureTimeDetails)[0];
    let values = (procedureTimeDetails as Record<string, ProcedureTimeResponse>)[data_agenda];

    const {
      cod_agenda,
      cod_empresa,
      cod_horarioagenda,
      cod_procedimento_assinatura,
      cod_procedimento_particular,
      cod_profissional,
      cod_sala,
      selected_time,
      vlr_procedimento_assinatura,
      vlr_procedimento_particular,
    } = values;

    console.log('vlr_procedimento_particular', vlr_procedimento_particular);

    let schedule: ScheduleRequest = {
      data_agenda,
      cod_agenda: Number(cod_agenda),
      cod_empresa: Number(cod_empresa),
      cod_horarioagenda: Number(cod_horarioagenda),
      cod_pessoa_pes: Number(dadosUsuarioData.pessoaDados?.id_pessoa_pes),
      cod_procedimento: assinante ? Number(cod_procedimento_assinatura) : Number(cod_procedimento_particular),
      cod_profissional: Number(cod_profissional),
      cod_sala: Number(cod_sala),
      hora_agenda: String(selected_time),
      payment_method: null,
      token_paciente: dadosUsuarioData.pessoaDados?.cod_token_pes!,
      vlr_procedimento: assinante
        ? convertStringToNumber(vlr_procedimento_assinatura)
        : convertStringToNumber(vlr_procedimento_particular),
    };

    console.log(JSON.stringify(schedule, null, 2));

    navigate('user-select-payment-method', schedule);
  };

  return (
    <>
      {loading ? (
        <View style={{ flex: 1 }}>
          <LoadingFull />
        </View>
      ) : (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {!procedureTimeDetails ? (
            <ProcedureError
              icon="alert-circle"
              title="Nenhum Horário Disponível"
              body="Infelizmente, não há horários para este procedimento no momento. Tente novamente mais tarde."
            />
          ) : (
            <View style={{ backgroundColor: colors.background, flex: 1 }}>
              <View>
                <Searchbar
                  placeholder="Pesquisar Profissional"
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={{ marginTop: 10, marginBottom: 10, backgroundColor: colors.secondaryContainer }}
                  loading={loading}
                />
              </View>

              <FlatList
                data={Object.entries(data)}
                renderItem={({ item, index }) => {
                  const procedureRecord: Record<string, ProcedureTimeResponse[]> = {
                    [item[0]]: item[1], // item[0] é a chave (data) e item[1] é o valor (array de procedimentos)
                  };

                  return (
                    <TimeCardComponent
                      procedure={procedureRecord}
                      currentSelectedProcedure={procedureTimeDetailsData.procedureTimeDetails}
                      onSelect={proc => {
                        unstable_batchedUpdates(() => {
                          //setCurrentSelectedProcedure(proc);
                          //setProcedureTimeDetailsData(proc);
                        });
                      }}
                    />
                  );
                }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
              />
            </View>
          )}
          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={['55%']}
            enablePanDownToClose
            handleIndicatorStyle={{ backgroundColor: colors.primary }}
            handleStyle={{
              backgroundColor: colors.surfaceVariant,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
            }}>
            <BottomSheetScrollView contentContainerStyle={[styles.sheetContent, { backgroundColor: colors.surfaceVariant }]}>
              {procedureTimeDetailsData.procedureTimeDetails ? (
                <>
                  {Object.entries(procedureTimeDetailsData.procedureTimeDetails).map(([date, procedure]) => (
                    <View key={date} style={{ paddingVertical: 10, width: '100%' }}>
                      <Text variant="titleLarge" style={{ color: colors.onSurface }}>
                        Resumo do Procedimento
                      </Text>
                      <Text variant="bodyMedium" style={{ marginTop: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>Data:</Text> {formatDateToDDMMYYYY(date)}
                      </Text>
                      <Text variant="bodyMedium" style={{ marginTop: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>Profissional:</Text> {procedure.nome_profissional}
                      </Text>
                      <Text variant="bodyMedium" style={{ marginTop: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>CRM:</Text> {procedure.conselho_profissional}
                      </Text>
                      <Text variant="bodyMedium" style={{ marginTop: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>Horário Selecionado:</Text> {formatTimeToHHMM(procedure.selected_time!)}
                      </Text>
                      <Text variant="bodyMedium" style={{ marginTop: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>Valor Assinante:</Text> R${' '}
                        {procedure.vlr_procedimento_assinatura}
                      </Text>
                      <Text variant="bodyMedium" style={{ marginTop: 5 }}>
                        <Text style={{ fontWeight: 'bold' }}>Valor Particular:</Text> R${' '}
                        {procedure.vlr_procedimento_particular}
                      </Text>

                      <Button
                        mode="contained"
                        style={{ marginTop: 20 }}
                        disabled={!dadosUsuarioData.pessoaAssinatura?.assinatura_liberada}
                        onPress={() => {
                          getScheduleRequestData(true);
                        }}>
                        {`Continuar como Assinante: R$: ${procedure.vlr_procedimento_assinatura}`}
                      </Button>

                      <Button
                        mode="outlined"
                        style={{ marginTop: 20 }}
                        onPress={() => {
                          getScheduleRequestData(false);
                        }}>
                        {`Continuar como Particular: R$: ${procedure.vlr_procedimento_particular}`}
                      </Button>

                      <View style={{ flexDirection: 'column', width: '100%' }}></View>
                    </View>
                  ))}
                </>
              ) : (
                <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                  Nenhum procedimento selecionado.
                </Text>
              )}
            </BottomSheetScrollView>
          </BottomSheet>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  text: {
    marginTop: 8,
    fontWeight: '600', // Mais moderno com peso de fonte mais forte
    textAlign: 'left',
  },
  sheetContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  timeButton: {
    paddingVertical: 10, // Altura do botão controlada pelo padding
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5, // Espaçamento entre os botões
    elevation: 2, // Sombras no Android
    shadowColor: '#000', // Sombras no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 100,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  flatList: {
    maxHeight: 80, // Limita a altura da FlatList
  },
  flatListContainer: {
    paddingVertical: 10,
  },
});
