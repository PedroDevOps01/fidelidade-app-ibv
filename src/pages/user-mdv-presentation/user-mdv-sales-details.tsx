import { RouteProp, useRoute } from '@react-navigation/native';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { formatDateToDDMMYYYY, maskBrazilianCurrency } from '../../utils/app-utils';

type UserMdvSalesDetailsRouteParams = {
  params: {
    sales: Sale[];
  };
};

export default function UserMdvSalesDetails() {
  const {colors} = useTheme()
  const route = useRoute<RouteProp<UserMdvSalesDetailsRouteParams, 'params'>>();
  const {sales} = route.params


  const RenderLine = ({item}: {item: Sale}) => (
    <Card mode='contained' style={styles.card}>
      <Card.Title
        title={item.des_nome_pes}
      />
      <Card.Content>
        <Text variant="bodyMedium">
          <Text style={styles.label}>Plano:</Text> {item.des_nome_pla}
        </Text>
        <Text variant="bodyMedium">
          <Text style={styles.label}>Forma de Pagamento:</Text> {item.des_nome_fmp}
        </Text>
        
        <Text variant="bodyMedium">
          <Text style={styles.label}>Valor:</Text> {`R$: ${maskBrazilianCurrency(item.vlr_parcela_ppg)}`}
        </Text>
        <Text variant="bodyMedium">
          <Text style={styles.label}>Data de Pagamento:</Text> {formatDateToDDMMYYYY(item.dta_pagamento_cpp) || 'Não pago'}
        </Text>
      </Card.Content>
    </Card>
  )




  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <FlatList 
        data={sales}
        renderItem={RenderLine}
        removeClippedSubviews={false}
      />
      
    </View>
  )





}


const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 8,
  },
  label: {
    fontWeight: 'bold',
  },
});