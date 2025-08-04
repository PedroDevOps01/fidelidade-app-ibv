import { Button, Card, Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { RefreshControl, View, StyleSheet, TouchableOpacity } from 'react-native';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useLayoutEffect} from "react";

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

export default function UserMdvSalesExtract({navigation}: {navigation: any}) {
  const { authData } = useAuth();
  const { colors } = useTheme();
  const route = useRoute<RouteProp<UserMdvSalesExtractRouteParams, 'params'>>();

  const [loading, setLoading] = useState<boolean>(false);
  const [periodModalVisible, setPeriodModalVisible] = useState<boolean>(false);
  const [mdvExtractData, setMdvExtractData] = useState<MdvExtractData[]>([]);
  const [dates, setDates] = useState<ExtractDates>({
    created_since: null,
    created_until: null,
  });
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);


  const renderPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <MaterialCommunityIcons name="credit-card" size={20} color="#5D5FEF" />;
      case "pix":
        return <MaterialCommunityIcons name="qrcode" size={20} color="#5D5FEF" />;
      default:
        return <MaterialCommunityIcons name="cash" size={20} color="#5D5FEF" />;
    }
  };

  const renderStatusBadge = (status: string) => {
    const isPaid = status === "paid";
    return (
      <View style={[
        styles.statusBadge, 
        { 
          backgroundColor: isPaid ? '#E8F5E9' : '#FFF8E1',
          borderColor: isPaid ? '#4CAF50' : '#FFC107'
        }
      ]}>
        <MaterialCommunityIcons 
          name={isPaid ? "check-circle" : "clock"} 
          size={16} 
          color={isPaid ? '#4CAF50' : '#FFC107'} 
        />
        <Text style={[
          styles.statusText,
          { color: isPaid ? '#4CAF50' : '#FFC107' }
        ]}>
          {isPaid ? "Pago" : "Aguardando"}
        </Text>
      </View>
    );
  };

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
    fetchExtract();
  }, [dates]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={goBack}
          style={styles.backButton}
        />
        <Text variant="titleLarge" style={[styles.headerTitle, { color: colors.onSurface }]}>
          Extrato de Vendas
        </Text>
        
      </View>

      {/* Active Filter Indicator */}
      {(dates.created_since || dates.created_until) && (
        <View style={[styles.activeFilterContainer, { backgroundColor: colors.secondaryContainer }]}>
          <Text style={[styles.activeFilterText, { color: colors.onSecondaryContainer }]}>
            Período: {dates.created_since ? formatDateToDDMMYYYY(dates.created_since) : 'Início'} - 
            {dates.created_until ? formatDateToDDMMYYYY(dates.created_until) : 'Fim'}
          </Text>
          <TouchableOpacity onPress={() => setDates({ created_since: null, created_until: null })}>
            <MaterialCommunityIcons 
              name="close" 
              size={20} 
              color={colors.onSecondaryContainer} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Transaction List */}
      <FlashList
        data={mdvExtractData}
        estimatedItemSize={100}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            colors={[colors.primary]}
            tintColor={colors.primary}
            onRefresh={fetchExtract}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="receipt-text-remove-outline" 
              size={64} 
              color={colors.outline} 
            />
            <Text variant="titleMedium" style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
              Nenhuma transação encontrada
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtext, { color: colors.onSurfaceVariant }]}>
              {dates.created_since || dates.created_until 
                ? "Tente ajustar o período selecionado" 
                : "Suas transações aparecerão aqui"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={[styles.transactionCard, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.transactionHeader}>
                <View style={styles.dateContainer}>
                  <MaterialCommunityIcons 
                    name="calendar" 
                    size={16} 
                    color={colors.onSurfaceVariant} 
                  />
                  <Text style={[styles.dateText, { color: colors.onSurface }]}>
                    {dayjs(item.created_at).format('DD/MM/YYYY - HH:mm')}
                  </Text>
                </View>
                <Text style={[styles.amountText, { color: colors.onSurface }]}>
                  {maskBrazilianCurrency(item.amount)}
                </Text>
              </View>

              <View style={styles.transactionDetails}>
                <View style={styles.detailRow}>
                  {renderPaymentMethodIcon(item.payment_method)}
                  <Text style={[styles.methodText, { color: colors.onSurface }]}>
                    {item.payment_method === "credit_card" ? "Cartão de Crédito" : "PIX"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  {renderStatusBadge(item.status)}
                </View>
              </View>

              <View style={[styles.transactionFooter, { borderTopColor: colors.outline }]}>
                <Text style={[styles.idText, { color: colors.onSurfaceVariant }]}>
                  ID: {item.charge_id}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      {/* Period Filter Modal */}
      <ModalContainer visible={periodModalVisible} handleVisible={() => setPeriodModalVisible(false)}>
        <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.onSurface }]}>
          Filtrar por Período
        </Text>
        
        <View style={styles.datePickersContainer}>
          <View style={styles.dateInputContainer}>
            <Text variant="labelMedium" style={[styles.dateLabel, { color: colors.onSurfaceVariant }]}>
              Data Inicial
            </Text>
            <CustomDatePicker
              value={dates.created_since}
              onChange={(e, date) => date && setDates(prev => ({ ...prev, created_since: date }))}
              mode="date"
            />
          </View>
          
          <View style={styles.dateInputContainer}>
            <Text variant="labelMedium" style={[styles.dateLabel, { color: colors.onSurfaceVariant }]}>
              Data Final
            </Text>
            <CustomDatePicker
              value={dates.created_until}
              onChange={(e, date) => date && setDates(prev => ({ ...prev, created_until: date }))}
              mode="date"
            />
          </View>
        </View>

        <View style={styles.modalButtons}>
          <Button 
            mode="outlined" 
            style={[styles.modalButton, { borderColor: colors.primary }]}
            onPress={() => setPeriodModalVisible(false)}
            textColor={colors.primary}>
            Cancelar
          </Button>
          <Button 
            mode="contained" 
            style={styles.modalButton}
            onPress={() => {
              setPeriodModalVisible(false);
              fetchExtract();
            }}
            buttonColor={colors.primary}
            textColor={colors.onPrimary}>
            Aplicar Filtro
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  activeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  activeFilterText: {
    fontWeight: '500',
    fontSize: 14,
  },
  transactionCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    fontSize: 14,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  transactionFooter: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  idText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  datePickersContainer: {
    gap: 20,
    marginVertical: 16,
  },
  dateInputContainer: {
    gap: 8,
  },
  dateLabel: {
    opacity: 0.8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 8,
  },
});