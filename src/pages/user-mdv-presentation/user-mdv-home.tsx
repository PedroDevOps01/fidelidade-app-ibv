import { useCallback, useState } from 'react';
import { Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, Menu, Text, useTheme } from 'react-native-paper';
import { navigate } from '../../router/navigationRef';
import { Dropdown } from 'react-native-element-dropdown';
import SalesChart from './charts/sales-charts';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { generateRequestHeader, log } from '../../utils/app-utils';
import { useAuth } from '../../context/AuthContext';
import TotalSalesValue from './charts/total-sales-value';
import CopyMdvLink from './charts/copy-mdv-link';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ModalContainer from '../../components/modal';
import CustomDatePicker from '../../components/custom-date-picker';
import { TextInput } from 'react-native-paper';
import {useLayoutEffect} from "react";

import dayjs from 'dayjs';

type DashboardDates = {
  startDate: Date | null;
  endDate: Date | null;
};

export default function UserMdvHome({navigation}: {navigation: any}) {
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();
  const { authData } = useAuth();
  const [codigoPromocional, setCodigoPromocional] = useState<string | undefined>(undefined);

  const [modalCodigoVisible, setModalCodigoVisible] = useState(false);
  const [inputCodigo, setInputCodigo] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [periodModalVisible, setPeriodModalVisible] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [dates, setDates] = useState<DashboardDates>({
    startDate: null,
    endDate: null,

  });

  const [totalSales, setTotalSales] = useState<Sale[]>([]);
 useLayoutEffect(() => {
     navigation.setOptions({ headerShown: true,
                  title: 'Minhas Vendas',
                          headerTitleAlign: 'center',

                    headerStyle: { backgroundColor: colors.primaryContainer },
    headerTintColor: colors.onPrimaryContainer,
  
       });
    }, [navigation]);

  const data = dadosUsuarioData.pessoaMdv?.map(e => {
    let tipo = '';
    if (e.id_tipo_cargo_umv == 1) tipo = 'Diretor';
    if (e.id_tipo_cargo_umv == 2) tipo = 'Gerente';
    if (e.id_tipo_cargo_umv == 3) tipo = 'Vendedor';

    return {
      label: tipo,
      value: e.id_usuario_mdv_umv,
    };
  });

  const [value, setValue] = useState(data![0].value);
  const [isFocus, setIsFocus] = useState(false);

  const fetchMonthlySales = async () => {
    setLoading(true);

    const id_pessoa = value;
    let qry = `usuario-mdv/relatorio/vendas?id_usuario=${id_pessoa}`;

    if (dates.startDate && dates.endDate) {
      qry += `&first_date=${dayjs(dates.startDate).format('YYYY-MM-DD')}&second_date=${dayjs(dates.endDate).format('YYYY-MM-DD')}`;
    }

    const response = await api.get(qry, generateRequestHeader(authData.access_token));
    if (response.status == 200) {
      const { data } = response;
      //log(`usuario-mdv/relatorio/vendas/${id_pessoa}`, data);
      setTotalSales(data.response);
      setLoading(false);
    } else {
      Alert.alert('Aviso', 'Erro ao carregar vendas! Tente novamente mais tarde.');
    }
  };

  const handleFocusEffect = useCallback(() => {
    fetchMonthlySales();
  }, [value]);

  useFocusEffect(handleFocusEffect);

  return (
<ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{
    padding: 16,
    paddingBottom: 0, // ou remova completamente
    minHeight: '100%', // força o conteúdo a ocupar pelo menos a tela toda
    backgroundColor: colors.background,
  }}
  refreshControl={
    <RefreshControl
      colors={[colors.primary]}
      tintColor={colors.primary}
      onRefresh={fetchMonthlySales}
    />
  }
>


      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={[styles.filterCard, { backgroundColor: colors.surface }]}>
          <Text variant="labelMedium" style={[styles.filterLabel, { color: colors.onSurfaceVariant }]}>
            NÍVEL DE VENDEDOR
          </Text>
          <Dropdown
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.primary,
                borderColor: isFocus ? colors.primary : colors.outline,
              },
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={[styles.selectedTextStyle, { color: colors.onTertiary }]}
            iconStyle={[styles.iconStyle, { color: colors.onTertiary }]}
            data={data!}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Selecione' : '...'}
            value={value ?? data![0]}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setValue(item.value);
              setIsFocus(false);
            }}
          />
        </View>
      </View>
      <TouchableOpacity onPress={() => setPeriodModalVisible(true)} style={[styles.dateFilterButton, { backgroundColor: colors.primary }]}>
        <Icon source="calendar" size={20} color={colors.onTertiary} />
        <Text variant="labelMedium" style={{ color: colors.onTertiary, marginLeft: 8 }}>
          Filtro Data: {dates.startDate ? formatDate(dates.startDate) : 'Início'} - {dates.endDate ? formatDate(dates.endDate) : 'Fim'}
        </Text>
      </TouchableOpacity>
      {/* Dashboard de Métricas */}
      <View style={styles.metricsContainer}>
        <TotalSalesValue salesData={totalSales} currentMdv={value} />

        <View style={styles.chartContainer}>
          <SalesChart salesData={totalSales} loading={loading} />
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.primary,  }]}
          onPress={() => navigate('user-mdv-sales-extract', { recipient_id: dadosUsuarioData.pessoaMdv?.filter(e => e.id_usuario_mdv_umv == value)[0].cod_recipients_umv })}>
          <Icon source="file-document" size={24} color={colors.primary} />
          <Text variant="labelLarge" style={[styles.actionText, { color: colors.primary }]}>
            Meu Extrato
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.primary, }]}
          onPress={() => {
            setInputCodigo(codigoPromocional ?? '');
            setModalCodigoVisible(true);
          }}>
          <Icon source="ticket" size={24} color={colors.primary} />
          <Text variant="labelLarge" style={[styles.actionText, { color: colors.primary }]}>
            Código Promocional
          </Text>
        </TouchableOpacity> */}

        <CopyMdvLink id={value} codigoPromocional={codigoPromocional} />
      </View>

      {/* Modal de Código Promocional */}
      <ModalContainer visible={modalCodigoVisible} handleVisible={() => setModalCodigoVisible(false)}>
        <Text variant="titleMedium" style={styles.modalTitle}>
          Código Promocional
        </Text>

        <TextInput
          mode="outlined"
          label="Digite seu código"
          value={inputCodigo}
          onChangeText={setInputCodigo}
          style={styles.textInput}
          outlineColor={colors.outline}
          activeOutlineColor={colors.primary}
        />

        <View style={styles.modalActions}>
          <Button mode="outlined" style={styles.modalButton} onPress={() => setModalCodigoVisible(false)}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            style={styles.modalButton}
            onPress={async () => {
              setLoading(true);
              const novoCodigo = await enviarCodigoPromo(value, inputCodigo, authData.access_token);
              setLoading(false);
              setModalCodigoVisible(false);

              if (novoCodigo) {
                setCodigoPromocional(novoCodigo);
                setInputCodigo(novoCodigo);
              }
            }}>
            Salvar
          </Button>
        </View>
      </ModalContainer>

      {/* Modal de Período */}
      <ModalContainer visible={periodModalVisible} handleVisible={() => setPeriodModalVisible(false)}>
        <Text variant="titleMedium" style={styles.modalTitle}>
          Selecionar Período
        </Text>

        <View style={styles.datePickerContainer}>
          <View style={styles.dateInput}>
            <Text variant="bodyMedium" style={styles.dateLabel}>
              Data Inicial
            </Text>
            <CustomDatePicker value={dates.startDate} onChange={(e, date) => date && setDates(prev => ({ ...prev, startDate: date }))} mode="date" />
          </View>

          <View style={styles.dateInput}>
            <Text variant="bodyMedium" style={styles.dateLabel}>
              Data Final
            </Text>
            <CustomDatePicker value={dates.endDate} onChange={(e, date) => date && setDates(prev => ({ ...prev, endDate: date }))} mode="date" />
          </View>
        </View>

        <View style={styles.modalActions}>
          <Button mode="outlined" style={styles.modalButton} onPress={() => setPeriodModalVisible(false)}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            style={styles.modalButton}
            onPress={() => {
              setPeriodModalVisible(false);
              fetchMonthlySales();
            }}>
            Aplicar
          </Button>
        </View>
      </ModalContainer>
    </ScrollView>
  );
}

// Função auxiliar para formatar datas (mantida)
const formatDate = (date: Date) => dayjs(date).format('DD/MM/YY');

// Estilos Atualizados (com adições para o novo modal)
const styles = StyleSheet.create({

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 50,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 22,
  },
  menuButton: {
    padding: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  filterCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  filterLabel: {
    marginBottom: 8,
    opacity: 0.8,
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 15,
    alignSelf: 'flex-start',
  },
  dropdown: {
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconStyle: {
    color: '#FFFFFF',
    width: 20,
    height: 20,
  },
  metricsContainer: {
    gap: 20,
    marginBottom: 24,
  },
  chartContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  actionButton: {
  flex: 1,
  minWidth: 120,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 16,
  padding: 12,
  elevation: 1,

  borderWidth: 1, // largura da borda
},
  actionText: {
    marginLeft: 12,
    fontWeight: '500',
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  datePickerContainer: {
    gap: 20,
  },
  dateInput: {
    gap: 8,
  },
  dateLabel: {
    opacity: 0.8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
  },
  textInput: {
    backgroundColor: '#FEF7FF',
    marginBottom: 20,
  },
});

async function enviarCodigoPromo(id: number, codigo: string, token: string) {
  try {
    console.log('enviarCodigoPromo chamado com:', { id, codigo }); // <-- log aqui

    const response = await api.post('/usuario-mdv/relatorio/receberCodigoPromo', { id, codigo }, generateRequestHeader(token));
    console.log('Resposta do servidor:', response.data); // <-- log resposta

    if (response.data.success) {
      Alert.alert('Sucesso', response.data.mensagem);
      return response.data.codigoPromocional; // Retorna o código válido
    }
  } catch (error: any) {
    console.error('Erro ao enviar código promocional:', error); // <-- log erro

    if (error.response && error.response.data.errors) {
      const mensagens = Object.values(error.response.data.errors).flat().join('\n');
      Alert.alert('Erro de validação', mensagens);
    } else if (error.response && error.response.data.message) {
      Alert.alert('Erro', error.response.data.message);
    } else {
      Alert.alert('Erro', 'Erro ao validar código promocional.');
    }
  }
}
