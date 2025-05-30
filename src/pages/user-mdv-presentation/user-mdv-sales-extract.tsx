import { Button, Card, Icon, IconButton, Menu, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { RefreshControl, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { goBack } from '../../router/navigationRef';
import ModalContainer from '../../components/modal';
import CustomDatePicker from '../../components/custom-date-picker';
import { RouteProp, useRoute } from '@react-navigation/native';
import { api } from '../../network/api';
import dayjs from 'dayjs';
import { formatDateToDDMMYYYY, generateRequestHeader, maskBrazilianCurrency } from '../../utils/app-utils';
import CustomToast from '../../components/custom-toast';
import { FlashList } from '@shopify/flash-list';

type ExtractDates = {
  created_since: Date | null;
  created_until: Date | null;
};

type UserMdvSalesExtractRouteParams = {
  params: {
    recipient_id: string;
  };
};

type MdvExtractData = {
  id: number;
  status: 'waiting_funds' | 'paid';
  amount: number;
  fee: number;
  anticipation_fee: number;
  fraud_coverage_fee: number;
  installment: number;
  gateway_id: number;
  charge_id: string;
  split_id: string;
  recipient_id: string;
  payment_date: string;
  type: 'chargeback' | 'refund' | 'chargeback_refund' | 'credit';
  payment_method: string;
  accrual_at: string;
  created_at: string;
};

export default function UserMdvSalesExtract() {
  const { authData } = useAuth();
  const { colors } = useTheme();
  const route = useRoute<RouteProp<UserMdvSalesExtractRouteParams, 'params'>>();

  const [loading, setLoading] = useState<boolean>(false);
  const [periodModalVisible, setPeriodModalVisible] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [mdvExtractData, setMdvExtractData] = useState<MdvExtractData[]>([]);

  const [dates, setDates] = useState<ExtractDates>({
    created_since: null,
    created_until: null,
  });

  function handlePaymentMethod(method: string) {
    switch (method) {
      case "credit_card":
        return "Cartão de Crédito";
      case "pix":
        return "PIX";
    }
  }

  async function fetchExtract() {
    setLoading(true);

    try {
      const { recipient_id } = route.params;
      let qry = `/dashboard/extratoRecebedor?recipient_id=${recipient_id}`;

      if (dates.created_since) {
        qry += `&created_since=${dayjs(dates.created_since).format('YYYY-MM-DD')}`;
      }
      if (dates.created_until) {
        qry += `&created_until=${dayjs(dates.created_until).format('YYYY-MM-DD')}`;
      }

      const response = await api.get(qry, generateRequestHeader(authData.access_token));

      if (response.status == 200) {
        const { data } = response.data.response.original;
        setMdvExtractData(data);
      }
    } catch (err) {
      CustomToast('Erro ao carregar dados', colors, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await fetchExtract()
    })()
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: 16, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton
          icon={'arrow-left'}
          style={{ margin: 0, padding: 0 }}
          onPress={() => {
            goBack();
          }}
        />

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

      <FlashList
        data={mdvExtractData}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              fetchExtract();
            }}
          />
        }
        renderItem={({ item }) => (
          <Card style={{ borderRadius: 0, elevation: 0, backgroundColor: colors.surface }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{dayjs(item.created_at).format('DD/MM/YYYY')}</Text>
              <Text style={{fontSize: 16 }}>Forma de pagamento: {handlePaymentMethod(item.payment_method)}</Text>
              <Text style={{fontSize: 16 }}>Status: {item.status == "paid" ? "Pago" : "Aguardando pagamento"}</Text>
              <Text style={{fontSize: 16 }}>Valor: {maskBrazilianCurrency(item.amount)}</Text>
            </Card.Content>
          </Card>
        )}
        removeClippedSubviews={false}
      />

      <ModalContainer visible={periodModalVisible} handleVisible={() => setPeriodModalVisible(false)}>
        <View>
          <Text variant="labelLarge">Data inicial</Text>
          <CustomDatePicker
            value={dates.created_since}
            onChange={(e, date) => {
              if (date) setDates(prev => ({ ...prev, created_since: date }));
            }}
            mode="date"
            label="Data"
          />
        </View>
        <View>
          <Text variant="labelLarge">Data final</Text>
          <CustomDatePicker
            value={dates.created_until}
            onChange={(e, date) => {
              if (date) setDates(prev => ({ ...prev, created_until: date }));
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
              fetchExtract();
            }}>
            Consultar
          </Button>
        </View>
      </ModalContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
