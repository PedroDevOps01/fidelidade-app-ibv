import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Badge, FAB, IconButton, Searchbar, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { api } from '../../network/api';
import { useAuth } from '../../context/AuthContext';
import { agruparConsultasPorGrupo } from '../../utils/app-utils';
import GroupedList from './grouped-list';
import { useConsultas } from '../../context/consultas-context';
import ProfissionalList from './professionals-list';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useExames } from '../../context/exames-context';
import React from 'react';
import Fab from '../../components/fab';

type fabOptionsProps = {
  icon: string;
  onPress: () => void;
  label: string;
};

export default function UserConsultasScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const { authData } = useAuth();
  const { setConsultasAgrupadasData, consultasAgrupadasData, currentProcedureMethod } = useConsultas();

  const { selectedExams, openBottomSheet } = useExames();

  const [professionals, setProfessionals] = useState<ProfessionallMedico[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentMethod, setCurrentMethod] = useState<string>('consulta');
  const [fabGroupVisible, setFabGroupVisible] = useState(false);
  const [fabOptions, setFabOptions] = useState<fabOptionsProps[]>([]);
  const isFocused = useIsFocused();

  async function fetchConsultas() {
    setLoading(true);
    try {
      const response = await api.get(`/integracao/${currentProcedureMethod == 'consulta' ? 'listProcedimentos' : 'listProcedimentosExames'}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      if (response.status == 200) {
        const ag = agruparConsultasPorGrupo(response.data);
        setConsultasAgrupadasData(ag);
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert('Aviso', 'Erro ao carregar consultas. Tente novamente mais tarde', [
        {
          text: 'Continuar',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfessionals() {
    if (currentMethod == 'exame') {
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/integracao/listProfissionais', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      if (response.status == 200) {
        setProfessionals(response.data);
      }
    } catch (err: any) {
      Alert.alert('Aviso', 'Erro ao carregar profissionais. Tente novamente mais tarde', [
        {
          text: 'Continuar',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    navigation.setOptions({
      title: currentProcedureMethod!.charAt(0).toUpperCase() + currentProcedureMethod!.slice(1).toLowerCase(),
    });

    (async () => {
      Promise.all([fetchConsultas(), fetchProfessionals()]);
    })();
  }, [navigation]);





  useEffect(() => {
    if(selectedExams.length > 0) {
      setFabOptions(prev => [
        {
          icon: 'calendar-today',
          onPress: openBottomSheet,
          label: 'Visualizar Agendamentos'
          
        }
      ])
    }
  }, [selectedExams])

  const filteredData = () => {
    if (currentMethod === 'consulta' && consultasAgrupadasData) {
      // Filtra as consultas agrupadas
      return Object.entries(consultasAgrupadasData.consultasAgrupadas!).reduce((acc, [grupo, procedimentos]) => {
        const filteredProcedimentos = procedimentos.filter(procedimento => procedimento.nome.toLowerCase().includes(searchQuery.toLowerCase()));
        if (filteredProcedimentos.length > 0) {
          acc[grupo] = filteredProcedimentos;
        }
        return acc;
      }, {} as ConsultasAgrupadas);
    } else if (currentMethod === 'medico' && professionals.length > 0) {
      // Filtra os profissionais
      return professionals.filter(professional => professional.nome_profissional.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return [];
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Searchbar no topo, fora das Tabs */}
      <Searchbar
        placeholder={currentMethod === 'consulta' ? 'Pesquise o procedimento' : 'Pesquise o profissional'}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ margin: 8, backgroundColor: colors.secondaryContainer }}
      />
      <TabsProvider
        defaultIndex={0}
        onChangeIndex={index => {
          setCurrentMethod(index === 0 ? 'consulta' : 'medico');
        }}>
        <Tabs style={{backgroundColor: colors.background}} theme={colors} disableSwipe>
          <TabScreen label="Procedimento" icon={'stethoscope'}>
            <GroupedList list={filteredData() as ConsultasAgrupadas} loading={loading} />
          </TabScreen>

          <TabScreen label="Profissional" icon={'medical-bag'} disabled={currentProcedureMethod == 'exame'}>
            <ProfissionalList data={filteredData()} navigation={navigation} loading={loading} />
          </TabScreen>
        </Tabs>
      </TabsProvider>

      {selectedExams.length > 0 ? (
        <Fab 
          icon='check'
          onPress={openBottomSheet}
        />
      ) : (
        <></>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'red',
    color: 'white',
  },
  fabStyle: {
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 0,
  },
});
