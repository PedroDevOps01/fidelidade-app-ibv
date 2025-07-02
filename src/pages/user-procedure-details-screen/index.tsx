import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import LoadingFull from '../../components/loading-full';
import { View } from 'react-native';
import { api } from '../../network/api';
import { useAuth } from '../../context/AuthContext';
import ProcedureError from './procedure-error';
import ProcedureDetails from './procedure-details';

export default function UserProcedureDetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { authData } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [proceduresDetails, setProceduresDetails] = useState<ProcedureResponse[]>([]);

  async function fetchProcedureDetails(id: number) {
    const cod_profissional = route.params.procedimento.cod_profissional;

    const url = cod_profissional
      ? `/integracao/listProfissionaisProcedimentosUnidades?cod_procedimento=${id}&cod_profissional=${route.params.procedimento.cod_profissional}`
      : `/integracao/listUnidadeProcedimento?cod_procedimento=${id}`;

    try {
      const response = await api.get(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });
      const { data } = response;
      if (Array.isArray(data)) {
        const newData = data.map(e => ({ ...e, cod_profissional }));
        setProceduresDetails(newData);
      } else {
        setProceduresDetails([]);
      }
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log(route.params);

    navigation.setOptions({ title: route.params.procedimento.nome });

    (async () => {
      await fetchProcedureDetails(Number(route.params.procedimento.cod_procedimento));
    })();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <View style={{ flex: 1 }}>
          {proceduresDetails!.length === 0 ? (
            <ProcedureError
              icon="alert-circle"
              title="Nenhum Horário Disponível"
              body="Infelizmente, não há horários para este procedimento no momento. Tente novamente mais tarde."
            />
          ) : (
            <View style={{ backgroundColor: colors.background, flex: 1 }}>
              <Text variant="titleLarge" style={[styles.text, { color: colors.onSurface }]}>
                Empresas que realizam o{'\n'}Procedimento:
              </Text>

              <ProcedureDetails procedures={proceduresDetails!} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  text: {
    marginTop: 8,
    fontWeight: '600', // Mais moderno com peso de fonte mais forte
    textAlign: 'left',
  },
});
