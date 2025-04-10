import {
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import {
  ActivityIndicator,
  Button, Icon, Menu,
  Text,
  useTheme
} from "react-native-paper";
import { navigate } from "../../../router/navigationRef";
import { useState } from "react";

const SalesChart = ({
  salesData,
  loading,
}: {
  salesData: Sale[];
  loading: boolean;
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();



  // Se `salesData` estiver vazio, mostrar um gráfico com valores padrão
  const isEmpty = salesData.length === 0;

  // Criar um conjunto de dados padrão vazio para o gráfico
  const emptyChartData = [{ value: 0, label: "" }];

  // Agrupar vendas por data
  const dateMap: Record<string, number> = salesData.reduce((acc, item) => {
    acc[item.dta_pagamento_cpp] =
      (acc[item.dta_pagamento_cpp] || 0) + item.vlr_parcela_ppg;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(dateMap);
  const valores = Object.values(dateMap).map((valor: any) => valor / 100);

  // Estruturando os dados para Gifted Charts
  const chartData = isEmpty
    ? emptyChartData
    : labels.map((date, index) => ({
        value: valores[index],
        label: date.split("-")[2], // Exibir a data no eixo X
      }));

  return (
    <View
      style={{
        height: "auto",
        paddingVertical: 20,
        borderRadius: 12,
        padding: 12,
        overflow: "hidden",
        backgroundColor: colors.surfaceVariant,
      }}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          {/* Título do gráfico */}
          <View
            style={{
              marginBottom: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.onSurface,
              }}
            >
              {isEmpty
                ? "Sem vendas registradas!"
                : `Total de vendas: ${salesData.length}`}
            </Text>

            {/* <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <Icon source={"menu"} size={30} />
                </TouchableOpacity>
              }
            >
              <Menu.Item onPress={() => {
                setMenuVisible(false)
              }} title="Período" />
            </Menu> */}
          </View>

          {/* 📌 ScrollView para evitar que o gráfico estoure o limite da View */}
          <ScrollView
            horizontal
            contentContainerStyle={{ flexGrow: 1 }}
            showsHorizontalScrollIndicator={false}
          >
            <View style={{ width: width * 0.9, overflow: "hidden" }}>
              {isEmpty ? (
                <></>
              ) : (
                <LineChart
                  data={chartData}
                  noOfSections={4}
                  spacing={60}
                  curved
                  thickness={3}
                  hideRules
                  showVerticalLines
                  color={isEmpty ? colors.onSurfaceDisabled : colors.primary} // Cinza quando não houver dados
                  startFillColor={
                    isEmpty ? "transparent" : colors.primaryContainer
                  }
                  endFillColor={
                    isEmpty ? "transparent" : colors.secondaryContainer
                  }
                  startOpacity={isEmpty ? 0 : 0.3}
                  endOpacity={isEmpty ? 0 : 0.1}
                  yAxisTextStyle={{ color: colors.onSurface, fontSize: 12 }}
                  xAxisLabelTextStyle={{
                    color: colors.onSurface,
                    fontSize: 12,
                    marginTop: 0,
                  }}
                  animationDuration={800}
                  isAnimated
                />
              )}
            </View>
          </ScrollView>

          {!isEmpty && (
            <View style={{ marginTop: 10 }}>
              <Button
                onPress={() => {
                  navigate("user-mdv-sales-details", { sales: salesData });
                }}
                key={"sales_report"}
                mode="contained"
              >
                Ver detalhes
              </Button>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default SalesChart;
