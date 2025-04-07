import {useEffect, useState} from 'react';
import {api} from '../../network/api';
import {Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {agruparConsultasPorGrupo} from '../../utils/app-utils';
import {List, Searchbar, useTheme} from 'react-native-paper';
import GroupedList from '../user-consultas-screen/grouped-list';
import LoadingFull from '../../components/loading-full';

interface UserProceduresByMedicoProps {
  navigation: any;
  route: any;
}

export default function UserProceduresByMedico({navigation, route}: UserProceduresByMedicoProps) {
  const [consultasAgrupadasData, setConsultasAgrupadasData] = useState<ConsultasAgrupadas>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const {authData} = useAuth();
  const {colors} = useTheme();

  async function fetchProceduresByCodProfessional(cod_profissional: string) {
    try {
      const response = await api.get(
        `/integracao/listProfissionaisProcedimentos?cod_profissional=${cod_profissional}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `bearer ${authData.access_token}`,
          },
        },
      );

      if (response.status == 200) {
        const ag = agruparConsultasPorGrupo(response.data);
        setConsultasAgrupadasData(ag);
      }
    } catch (err: any) {
      Alert.alert('Aviso', 'Erro ao carregar horários', [
        {
          text: 'ok',
          onPress: () => navigation.goBack(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await fetchProceduresByCodProfessional(route.params.professional.cod_profissional);
    })();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    groupContainer: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      marginVertical: 4,
      overflow: 'hidden',
    },
    listItem: {
      backgroundColor: colors.surface,
      paddingLeft: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.onSurfaceVariant,
    },
    accordionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
    },
    listItemTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.onSurface,
    },
    listItemDescription: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
  });

  const filteredData = () => {
    // Filtra as consultas agrupadas
    return Object.entries(consultasAgrupadasData!).reduce((acc, [grupo, procedimentos]) => {
      const filteredProcedimentos = procedimentos.filter(procedimento =>
        procedimento.nome.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      if (filteredProcedimentos.length > 0) {
        acc[grupo] = filteredProcedimentos;
      }
      return acc;
    }, {} as ConsultasAgrupadas);

  };

  const renderAccordion = ({item}: {item: [string, ConsultaReposta[]]}) => {
    const [grupo, procedimentos] = item;

    return (
      <List.Accordion title={grupo} id={grupo} style={styles.groupContainer} titleStyle={styles.accordionTitle}>
        <FlatList
          data={procedimentos}
          keyExtractor={procedimento => procedimento.cod_procedimento}
          renderItem={({item: procedimento}) => (
            <List.Item
              title={<Text style={styles.listItemTitle}>{procedimento.nome}</Text>}
              description={<Text style={styles.listItemDescription}>{`Código: ${procedimento.cod_procedimento}`}</Text>}
              style={styles.listItem}
              onPress={() => {
                navigation.navigate('user-procedure-details-screen', {
                  procedimento: {
                    ...procedimento,
                    cod_profissional: route.params.professional.cod_profissional
                  }
                  
                });
              }}
            />
          )}
        />
      </List.Accordion>
    );
  };

  return (
    <View style={[styles.container, {paddingHorizontal: 10, backgroundColor: colors.background}]}>
      <View style={{flex: 1}}>
        <Searchbar
          placeholder={'Pesquisar procedimento'}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{marginTop: 12, marginBottom: 6}}
          loading={loading}
        />
      </View>
      <View style={{flex: 9}}>
        {loading && !consultasAgrupadasData ? (
          <LoadingFull title="Carregando consultas..." />
        ) : (
          <FlatList
            data={Object.entries(filteredData())}
            keyExtractor={item => item[0]} // O nome do grupo será a chave
            renderItem={renderAccordion}
          />
        )}
      </View>
    </View>
  );
}
