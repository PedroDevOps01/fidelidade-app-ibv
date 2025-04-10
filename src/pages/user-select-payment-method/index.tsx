import { useRoute } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Alert, FlatList } from 'react-native';
import { RadioButton, Text, Button, useTheme, ActivityIndicator, List } from 'react-native-paper';
import { fetchOptionsAutoFormaPagamentoContract } from '../../utils/fetch-select-data';
import { useAuth } from '../../context/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';
import { navigate } from '../../router/navigationRef';
import { useExames } from '../../context/exames-context';
import { useConsultas } from '../../context/consultas-context';
import { log } from '../../utils/app-utils';
import LoadingFull from '../../components/loading-full';
import CustomToast from '../../components/custom-toast';

const UserSelectPaymentMethod = () => {
  const { colors } = useTheme();
  const { authData } = useAuth();
  const { currentProcedureMethod } = useConsultas();
  const { scheduleRequest, setScheduleRequestData } = useExames();
  const route = useRoute();

  // Forma de pagamentos
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [selectedFormasPagamento, setSelectedFormasPagamento] = useState<string | null>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchOptionsAutoFormaPagamentoContract(authData.access_token);
      setFormasPagamento(data);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = (selectedFormasPagamento: string) => {

    if(selectedFormasPagamento == '') {
      CustomToast('Selecione uma forma de pagamento.', colors);
      return
    }

    let schedule: ScheduleRequest = (route.params as ScheduleRequest) ?? scheduleRequest;

    schedule = {
      ...schedule,
      payment_method: selectedFormasPagamento === '10001' ? 'pix' : 'credit_card',
    };

    log('schedule', schedule);

    if (currentProcedureMethod == 'exame') {
      setScheduleRequestData(schedule);
    }

    if (selectedFormasPagamento === '10001') {
      navigate('user-payment-pix-schedule-screen', schedule);
    } else if (selectedFormasPagamento === '10002') {
      navigate('user-payment-creditcard-schedule-screen', schedule);
    }
  };



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <List.Section title='Selecione uma Forma de pagamento'>
          <FlatList
            data={formasPagamento}
            renderItem={({ item }) => (
              <List.Item
                title={item.des_nome_fmp}
                right={props => <List.Icon {...props} icon={'chevron-right'} />}
                onPress={() => handleSubmit(String(item.id_forma_pagamento_fmp))}
              />
            )}
          />
        </List.Section>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  radioContainer: {
    gap: 10, // Espaçamento entre os RadioButton Items
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserSelectPaymentMethod;
