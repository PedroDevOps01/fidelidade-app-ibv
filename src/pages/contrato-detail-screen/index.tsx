import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ActivityIndicator, List, Text, useTheme, Divider } from 'react-native-paper';
import dayjs from 'dayjs';
import { maskBrazilianCurrency } from '../../utils/app-utils';
import { navigate } from '../../router/navigationRef';

interface ContratosDetailScreenProps {
  contrato: ContratoResponse;
  title: string;
}

const ContratosDetailScreen = ({ contrato, title }: ContratosDetailScreenProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(false);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!contrato) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Nenhum dado disponível</Text>
      </View>
    );
  }

  function getIcon(icon: string) {
    switch (icon) {
      case 'Sistema':
        return <List.Icon icon="monitor" />;
      case 'APP':
        return <List.Icon icon="cellphone" />;
      default:
        return <List.Icon icon="help-circle" />;
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <List.Section>
          <Divider />

          <List.Item title="Nome do Cliente" description={contrato.des_nome_pes} left={() => <List.Icon icon="account" />} style={styles.listItem} />
          <Divider />

          <List.Item title="Nome do Plano" description={contrato.des_nome_pla} left={() => <List.Icon icon="briefcase" />} style={styles.listItem} />
          <Divider />

          <List.Item
            title="Quantidade de Parcelas"
            description={`${contrato.qtd_parcelas_ctt} (Ver parcelas)`}
            left={() => <List.Icon icon="file-document-multiple-outline" />}
            right={() => <List.Icon icon="arrow-right" />}
            onPress={() => {
              navigate('contrato-parcela-details', {
                idContrato: contrato.id_contrato_ctt,
              });
            }}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Valor Inicial"
            description={`R$: ${maskBrazilianCurrency(contrato.vlr_inicial_ctt)}`}
            left={() => <List.Icon icon="currency-usd" />}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Status do Contrato"
            description={contrato.is_ativo_ctt ? 'Ativo' : 'Inativo'}
            left={() =>
              contrato.is_ativo_ctt ? (
                <List.Icon icon="check-circle-outline" color={theme.colors.primary} />
              ) : (
                <List.Icon icon="checkbox-blank-circle-outline" color={theme.colors.error} />
              )
            }
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Data de Cadastro"
            description={dayjs(contrato.dth_cadastro_ctt).format('DD/MM/YYYY')}
            left={() => <List.Icon icon="calendar" />}
            style={styles.listItem}
          />
          <Divider />

          <List.Item title="Origem" description={contrato.des_origem_ori} left={() => getIcon(contrato.des_origem_ori)} style={styles.listItem} />
          <Divider />

          <List.Item title="Descrição" description={contrato.des_descricao_tsi} left={() => <List.Icon icon="card-text-outline" />} style={styles.listItem} />

          <List.Item
            title="Dependentes"
            description={`Ver dependentes`}
            left={() => <List.Icon icon="account-multiple"  />}
            right={() => <List.Icon icon="arrow-right" />}
            onPress={() => {
              navigate('user-dependents-screen');
            }}
            style={styles.listItem}
          />

          





        </List.Section>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    margin: 0,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  listItem: {
    paddingVertical: 12,
  },
});

export default ContratosDetailScreen;
