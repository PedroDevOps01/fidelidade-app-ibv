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
import dayjs from 'dayjs';

type DashboardDates = {
  startDate: Date | null;
  endDate: Date | null;
};

export default function UserMdvHome() {
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();
  const { authData } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [periodModalVisible, setPeriodModalVisible] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [dates, setDates] = useState<DashboardDates>({
    startDate: null,
    endDate: null,
  });

  const [totalSales, setTotalSales] = useState<Sale[]>([]);

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
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => {
            fetchMonthlySales();
          }}
        />
      }>
      <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
          Minhas vendas
        </Text>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Icon source={'menu'} size={30} />
            </TouchableOpacity>
          }>
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setPeriodModalVisible(true);
            }}
            title="Período"
          />
        </Menu>
      </View>

      <View style={[styles.cardContainer, { backgroundColor: colors.surfaceVariant, marginVertical: 10 }]}>
        <Text style={[styles.textCard, { color: colors.onSurface, marginBottom: 10 }]}>Nível de vendedor:</Text>
        <Dropdown
          style={[styles.dropdown, { borderColor: colors.primary, backgroundColor: colors.primary }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={[styles.selectedTextStyle, { color: colors.onPrimary }]}
          iconStyle={styles.iconStyle}
          data={data!}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select item' : '...'}
          searchPlaceholder="Search..."
          value={value ?? data![0]}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
          }}
        />
      </View>

      <View style={{ gap: 10 }}>
        <SalesChart salesData={totalSales} loading={loading} />
        <View style={[styles.cardContainer, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.textCard, { color: colors.onSurface, marginBottom: 10 }]}>Meu Extrato</Text>
          <Button
            key={'get_extract'}
            mode="contained"
            onPress={() => {
              navigate('user-mdv-sales-extract', { recipient_id: dadosUsuarioData.pessoaMdv?.filter(e => e.id_usuario_mdv_umv == value)[0].cod_recipients_umv });
            }}>
            Consultar extrato
          </Button>
        </View>
        <TotalSalesValue salesData={totalSales} currentMdv={value} />
        <CopyMdvLink id={value} />

        {/* <View style={[styles.cardContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.textCard, { color: colors.onSurface, marginBottom: 10 }]}>Meus dados Bancários</Text>

            <Button
              key={'get_all_money'}
              mode="contained"
              onPress={() => {
                navigate('user-mdv-bank-list');
              }}>
              Consultar meus dados bancários
            </Button>
          </View> */}
      </View>

      <ModalContainer visible={periodModalVisible} handleVisible={() => setPeriodModalVisible(false)}>
        <View>
          <Text variant="labelLarge">Data inicial</Text>
          <CustomDatePicker
            value={dates.startDate}
            onChange={(e, date) => {
              if (date) setDates(prev => ({ ...prev, startDate: date }));
            }}
            mode="date"
            label="Data"
          />
        </View>
        <View>
          <Text variant="labelLarge">Data final</Text>
          <CustomDatePicker
            value={dates.endDate}
            onChange={(e, date) => {
              if (date) setDates(prev => ({ ...prev, endDate: date }));
            }}
            mode="date"
            label="Data"
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          <Button
            style={{ width: '45%' }}
            mode="outlined"
            onPress={() => {
              setPeriodModalVisible(false);
            }}>
            Voltar
          </Button>
          <Button
            style={{ width: '45%' }}
            mode="contained"
            onPress={() => {
              setPeriodModalVisible(false);
              fetchMonthlySales();
            }}>
            Consultar
          </Button>
        </View>
      </ModalContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  cardContainer: { height: 'auto', paddingVertical: 20, borderRadius: 12, padding: 12, overflow: 'hidden' },
  textCard: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconContainer: {
    position: 'relative',
  },
});
