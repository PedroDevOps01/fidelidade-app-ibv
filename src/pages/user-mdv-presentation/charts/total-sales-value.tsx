import { useWindowDimensions, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { maskBrazilianCurrency } from "../../../utils/app-utils";

export default function TotalSalesValue({ salesData }: { salesData: Sale[] }) {

  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // Se `salesData` estiver vazio, mostrar um gráfico com valores padrão
  const isEmpty = salesData.length === 0;


  // Agrupar vendas por data
  const dateMap: Record<string, number> = salesData.reduce((acc, item) => {
    acc[item.dta_pagamento_cpp] = (acc[item.dta_pagamento_cpp] || 0) + item.vlr_parcela_ppg;
    return acc;
  }, {} as Record<string, number>);

  const totalValue = salesData.reduce((acc, item) => acc + item.vlr_parcela_ppg, 0)


  return (
    <View style={{ height: 'auto', paddingVertical: 20, borderRadius: 12, padding: 12, overflow: "hidden", backgroundColor: colors.surfaceVariant }}>
      {/* Título do gráfico */}
      <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.onSurface, marginBottom: 10 }}>
        {isEmpty ? "Sem vendas registradas!" : `Total de vendas R$: ${maskBrazilianCurrency(totalValue)}`}
      </Text>

      <Button key={'get_all_money'} mode="contained">
        Transferir para minha conta
      </Button>

    </View>
  );
}