import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { PaperSelect } from 'react-native-paper-select';
import { fetchOptionsAutoFormaPagamento, fetchOptionsAutoParcelas, fetchOptionsAutoPlano } from '../../utils/fetch-select-data';
import { useAuth } from '../../context/AuthContext';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { NewListItem } from '../../types/new__list_item';
import { convertToReais, log } from '../../utils/app-utils';
import LoadingFull from '../../components/loading-full';
import { api } from '../../network/api';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { goBack, navigate } from '../../router/navigationRef';

const defaultValues: PaperSelectContent = {
  value: '',
  list: [],
  selectedList: [],
  error: '',
};

const NewContratoScreen = () => {
  const theme = useTheme();
  const { authData } = useAuth();
  const navigation = useNavigation();

  //id_pessoa_usr
  const { loginUsuarioData } = useDadosUsuario();

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCreateContrato, setLoadingCreateContrato] = useState<boolean>(false);

  // planos
  const [planos, setPlanos] = useState<PaperSelectContent>(defaultValues);
  // Forma de pagamentos
  const [formaPagamento, setFormaPagamento] = useState<PaperSelectContent>(defaultValues);
  // parcelas
  const [parcelas, setParcelas] = useState<PaperSelectContent>(defaultValues);
  // valor adesao
  const [valorAdesao, setValorAdesao] = useState<string>('');
  // dia da parcela (1~31)
  const [diaParcela, setDiaParcela] = useState('');

  useEffect(() => {
    (() => {
      fetchOptionsAutoPlano(authData.access_token)
        .then(data => {
          setPlanos(prev => ({
            ...prev,
            list: data,
            error: 'Selecione um plano',
          }));
        })
        .catch(err => {
          console.log('Erro ao carregar planos', err);
        })
        .finally(() => {
          setLoading(false);
        });
    })();
  }, []);

  useEffect(() => {
    if (planos.selectedList.length > 0) {
      (async () => {
        fetchOptionsAutoFormaPagamento(planos.selectedList[0]._id, authData.access_token).then(data => {
          setFormaPagamento(prev => ({
            ...prev,
            list: data,
            error: 'Selecione uma forma de pagamento',
          }));
        });
      })();
    }
  }, [planos.selectedList]);

  useEffect(() => {
    if (formaPagamento.selectedList.length > 0) {
      (async () => {
        fetchOptionsAutoParcelas(formaPagamento.selectedList[0]._id, authData.access_token).then(data => {
          setParcelas(prev => ({
            ...prev,
            list: data,
            error: 'Selecione uma parcela',
          }));
        });
      })();
    }
  }, [formaPagamento.selectedList]);

  useEffect(() => {
    return () => {
      setPlanos(defaultValues);
      setFormaPagamento(defaultValues);
      setParcelas(defaultValues);
      setValorAdesao('');
      setDiaParcela('1');
    };
  }, []);

  const handleDiaParcelaChange = (value: string) => {
    if (value === '') {
      setDiaParcela(value);
      return;
    }

    let numericValue = parseInt(value, 10);

    if (isNaN(numericValue) || numericValue < 1) {
      numericValue = 1;
    } else if (numericValue > 31) {
      numericValue = 31;
    }

    setDiaParcela(numericValue.toString());
  };

  const handleSubmit = () => {
    const planoErro = planos.error;
    const formaPagamentoErro = formaPagamento.error;
    const parcelaErro = parcelas.error;

    if (planoErro != '' || formaPagamentoErro != '' || parcelaErro != '' || diaParcela == '') {
      Alert.alert('Aviso', `Verifique os campos antes de continuar`);
      return;
    }
  
    const valuesToRegister = {
      vlr_adesao_ctt: Number(valorAdesao.replace(/[.,]/g, '')),
      dta_dia_cpc: diaParcela,
      vlr_inicial_ctt: Number(valorAdesao.replace(/[.,]/g, '')),
      vlr_parcela_cpc: Number(valorAdesao.replace(/[.,]/g, '')),
      id_plano_pagamento_ctt: Number(parcelas.selectedList[0]._id),
    };

    onSubmit(valuesToRegister);
  };

  const onSubmit = async (rest: object) => {
    setLoadingCreateContrato(true);
    try {
      const dataToSend = {
        ...rest,
        id_pessoa_ctt: loginUsuarioData.id_pessoa_usr,
        id_situacao_ctt: 15,
        id_origem_ctt: 12,
        is_mobile: true
      };


      const request = await api.post('/contrato', dataToSend, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      if (request.status === 200) {
        Alert.alert('Aviso', 'Contrato criado com sucesso!', [
          {
            text: 'Confirmar',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (err: any) {
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Erro desconhecido';
        Alert.alert('Aviso', `Erro ao cadastrar contrato: ${errorMessage}`);
      } else {
        Alert.alert('Aviso', 'Erro ao cadastrar contrato. Verifique sua conexão e tente novamente');
      }
    } finally {
      setLoadingCreateContrato(false);
    }
  };

  return (
    <>
      {loading ? (
        <LoadingFull />
      ) : (
        <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            {planos.list.length > 0 && (
              <>
                <PaperSelect
                  theme={theme}
                  label="Escolha um plano"
                  value={planos.value}
                  onSelection={(value: any) => {
                    const possibleValorAdesao = value.selectedList[0];
                    if (!possibleValorAdesao) {
                      setValorAdesao('');
                    } else {
                      setValorAdesao(String(value.selectedList[0].optionalValue1));
                    }
                    setPlanos({
                      ...planos,
                      value: value.text,
                      selectedList: value.selectedList,
                      error: '',
                    });
                  }}
                  arrayList={[...planos.list]}
                  selectedArrayList={planos.selectedList}
                  errorText={planos.error}
                  multiEnable={false}
                  dialogTitleStyle={{ color: theme.colors.primary }}
                  textInputMode="outlined"
                  dialogCloseButtonText="Cancelar"
                  dialogDoneButtonText="Continuar"
                  hideSearchBox
                  dialogStyle={styles.selectDialogSyle}
                  textInputOutlineStyle={{ borderColor: theme.colors.primary }}
                />

                <PaperSelect
                  label="Escolha uma forma de pagamento"
                  disabled={planos.selectedList.length == 0}
                  value={formaPagamento.value}
                  onSelection={(value: any) => {
                    setFormaPagamento({
                      ...planos,
                      value: value.text,
                      selectedList: value.selectedList,
                      error: '',
                    });
                  }}
                  arrayList={[...formaPagamento.list]}
                  selectedArrayList={formaPagamento.selectedList}
                  errorText={formaPagamento.error}
                  multiEnable={false}
                  dialogTitleStyle={{ color: theme.colors.primary }}
                  textInputMode="outlined"
                  dialogCloseButtonText="Cancelar"
                  dialogDoneButtonText="Continuar"
                  hideSearchBox
                  dialogStyle={styles.selectDialogSyle}
                  textInputOutlineStyle={{ borderColor: theme.colors.primary }}
                />

                <PaperSelect
                  label="Parcelas"
                  disabled={formaPagamento.selectedList.length == 0}
                  value={parcelas.value}
                  onSelection={(value: any) => {
                    setParcelas({
                      ...planos,
                      value: value.text,
                      selectedList: value.selectedList,
                      error: '',
                    });
                  }}
                  arrayList={[...parcelas.list]}
                  selectedArrayList={parcelas.selectedList}
                  errorText={parcelas.error}
                  multiEnable={false}
                  dialogTitleStyle={{ color: 'red' }}
                  textInputMode="outlined"
                  dialogCloseButtonText="Cancelar"
                  dialogDoneButtonText="Continuar"
                  hideSearchBox
                  dialogStyle={styles.selectDialogSyle}
                  textInputOutlineStyle={{ borderColor: theme.colors.primary }}
                />
              </>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {/* <TextInput
                label="Valor de adesão"
                value={convertToReais(valorAdesao)}
                onChangeText={setValorAdesao}
                mode="outlined"
                style={[styles.input, { width: '48%' }]}
                keyboardType="numeric"
                disabled
              /> */}

              <TextInput
                label="Dia da parcela"
                value={diaParcela}
                onChangeText={handleDiaParcelaChange}
                mode="outlined"
                style={[styles.input, { width: '100%' }]}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <Button mode="contained" style={styles.button} onPress={handleSubmit} >
            <Text style={[styles.buttonText, { color: theme.colors.inverseOnSurface }]}>Continuar para pagamento</Text>
          </Button>
          
          <Button mode="outlined" style={styles.button} onPress={() => goBack()} >
            <Text>Voltar</Text>
          </Button>

        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between', // Isso garante que o botão fique no final
  },
  scrollContentContainer: {
    paddingBottom: 16, // Espaço extra para o botão não cobrir o conteúdo
  },
  selectDialogSyle: {
    overflow: 'scroll',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 16,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default NewContratoScreen;
