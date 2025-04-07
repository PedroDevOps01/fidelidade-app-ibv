import { useCallback, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { navigate } from '../../router/navigationRef';
import { Dropdown } from 'react-native-element-dropdown';
import SalesChart from './charts/sales-charts';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { generateRequestHeader, log } from '../../utils/app-utils';
import { useAuth } from '../../context/AuthContext';
import TotalSalesValue from './charts/total-sales-value';
import CopyMdvLink from './charts/copy-mdv-link';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

export default function UserMdvHome() {
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();
  const { authData } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);

  const [totalSales, setTotalSales] = useState<Sale[]>([
    {
      id_contrato_ctt: 8,
      id_pessoa_ctt: 207,
      des_nome_pes: 'Pedro Ian Pietro Campos',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-01',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 25000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-02',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-03',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 8,
      id_pessoa_ctt: 207,
      des_nome_pes: 'Pedro Ian Pietro Campos',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-04',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 25000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-05',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-06',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 8,
      id_pessoa_ctt: 207,
      des_nome_pes: 'Pedro Ian Pietro Campos',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-07',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 25000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-08',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-09',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 8,
      id_pessoa_ctt: 207,
      des_nome_pes: 'Pedro Ian Pietro Campos',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-10',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 25000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-11',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-12',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 8,
      id_pessoa_ctt: 207,
      des_nome_pes: 'Pedro Ian Pietro Campos',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-13',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 25000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-14',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-15',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 8,
      id_pessoa_ctt: 207,
      des_nome_pes: 'Pedro Ian Pietro Campos',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-16',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 25000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-17',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 10000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-18',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 8,
      id_pessoa_ctt: 207,
      des_nome_pes: 'Pedro Ian Pietro Campos',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 15432,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-19',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 25123,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-20',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 12444,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-21',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 8,
      id_pessoa_ctt: 207,
      des_nome_pes: 'Pedro Ian Pietro Campos',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 22222,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-22',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 11111,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-23',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 54321,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-24',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 12345,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-25',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 12000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-26',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 8,
      id_pessoa_ctt: 207,
      des_nome_pes: 'Pedro Ian Pietro Campos',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 17000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-27',
      id_vendedor_mdv_ctt: 1,
    },
    {
      id_contrato_ctt: 7,
      id_pessoa_ctt: 206,
      des_nome_pes: 'Nina Raquel Teixeira',
      id_situacao_ctt: 15,
      id_plano_pagamento_ctt: 1783,
      num_parcelas_ppg: 1,
      vlr_parcela_ppg: 29000,
      des_nome_pla: 'INDIVIDUAL MENSAL',
      des_nome_fmp: 'PIX (INTEGRACAO SISTEMA)',
      id_situacao_cpp: 11,
      dta_pagamento_cpp: '2025-02-28',
      id_vendedor_mdv_ctt: 1,
    },
  ]);

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

    // const id_pessoa = dadosUsuarioData.pessoaMdv?.filter(e => e.id_tipo_cargo_umv == 3)[0].id_usuario_mdv_umv;
    const id_pessoa = value;
    const response = await api.get(`usuario-mdv/relatorio/vendas/${id_pessoa}`, generateRequestHeader(authData.access_token));
    if (response.status == 200) {
      const { data } = response;
      log(`usuario-mdv/relatorio/vendas/${id_pessoa}`, data);
      //setTotalSales(data.response);
      setLoading(false);
    } else {
      Alert.alert('Aviso', 'Erro ao carregar vendas! Tente novamente mais tarde.');
    }
  };

  //log('dadosUsuarioData', dadosUsuarioData);

  useFocusEffect(
    useCallback(() => {
      fetchMonthlySales();
    }, [value]),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container}>
        <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 10 }}>
          Minhas vendas
        </Text>
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
          <TotalSalesValue salesData={totalSales} />
          <CopyMdvLink id={value} />

          <View style={[styles.cardContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.textCard, { color: colors.onSurface, marginBottom: 10 }]}>Meus dados Bancários</Text>

            <Button
              key={'get_all_money'}
              mode="contained"
              onPress={() => {
                navigate('user-mdv-bank-list');
              }}>
              Consultar meus dados bancários
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 100,
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
});
