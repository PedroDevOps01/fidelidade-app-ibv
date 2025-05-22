import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { convertToReais, transformMonthNumberToString } from '../../utils/app-utils';
import { navigate } from '../../router/navigationRef';

const ContratoParcelaDetailsCard = ({ item }: { item: ContratoParcelaDetails }) => {
  const { colors } = useTheme();

  return (
    <Card
      style={[styles.card, { backgroundColor: colors.background }]}
      onPress={() => {
        if (item.des_descricao_tsi) return;
        navigate('user-contratos-payment-resume-screen', { item });
      }}>
      <Card.Title title={`Parcela #${item.cod_numparcela_cpc}`} subtitle={`Valor: R$ ${convertToReais(item.vlr_parcela_cpc)}`} />
      <Card.Content>
        <Text>{`Data: ${item.dta_dia_cpc} de ${transformMonthNumberToString(Number(item.dta_mes_cpc))} ${item.ano_pagamento ? `de ${item.ano_pagamento}` : ''}`}</Text>

        {item.des_nome_fmp && <Text>{`Forma de pagamento: ${item.des_nome_fmp}`}</Text>}

        {item.valor_pago && <Text>{`Valor pago: R$ ${convertToReais(item.valor_pago)}`}</Text>}

        {item.is_ativo_cpc === 0 && <Text style={{ color: colors.error }}>Status da parcela: Inativo</Text>}

        <Text
          style={{
            color: !item.des_descricao_tsi ? colors.error : colors.primary,
            marginTop: 8,
          }}>
          {`Situação: ${!item.des_descricao_tsi ? 'Aguardando pagamento (Pagar)' : `${item.des_descricao_tsi}`}`}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 0,
    elevation: 0,
    shadowColor: 'transparent',
  },
});

export default ContratoParcelaDetailsCard;
