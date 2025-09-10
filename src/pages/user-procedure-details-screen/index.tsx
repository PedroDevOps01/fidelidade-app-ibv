import { useEffect, useState } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Text, useTheme, Card, Divider } from 'react-native-paper';
import LoadingFull from '../../components/loading-full';
import { api } from '../../network/api';
import { useAuth } from '../../context/AuthContext';
import ProcedureError from './procedure-error';
import ProcedureDetails from './procedure-details';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Alert, ScrollView } from 'react-native';

export default function UserProcedureDetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { authData } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [proceduresDetails, setProceduresDetails] = useState<ProcedureResponse[]>([]);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  async function fetchProcedureDetails(id: number) {
    // const cod_profissional = route.params.procedimento.cod_profissional;

    const url = `/integracao/listUnidadeProcedimento?cod_procedimento=${id}`;

    try {
      console.log('Fetching procedure details with URL:', url);
      console.log('Access Token:', authData.access_token);

      const response = await api.get(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      console.log('Response Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));

      const { data } = response;

      // Verificar se a resposta é válida
      if (Array.isArray(data)) {
        const newData = data
  .filter((item: any): item is NonNullable<any> => item !== null && item !== undefined)
  .map(item => ({
    cod_procedimento_assinatura: item.cod_procedimento_assinatura || '',
    valor_assinatura: item.valor_assinatura || '',
    convenio_assinatura: item.convenio_assinatura || '',
    cod_procedimento_particular: item.cod_procedimento_particular || '',
    valor_particular: item.valor_particular || '',
    convenio_particular: item.convenio_particular || '',
    nome: item.nome || '',
    des_descricao_tpr: route.params.procedimento.des_descricao_tpr || '',
    cod_procedimento_rpi: item.cod_procedimento || '',
    cod_procedimento: id,
    empresa: item.empresa || '',
    cod_empresa: item.cod_empresa || '',
    endereco: item.endereco || '',
    numero: item.numero || '',
    bairro: item.bairro || '',
    cidade: item.cidade || '',
    estado: item.estado || '',
    fachada_empresa: item.fachada_empresa || '',
    cod_parceiro: item.cod_parceiro || '',
  }))
  .sort((a, b) => {
    const valA = parseFloat(a.valor_particular || a.valor_assinatura || '0');
    const valB = parseFloat(b.valor_particular || b.valor_assinatura || '0');
    return valA - valB; // menor para maior
  });

setProceduresDetails(newData);


        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        console.warn('Response is not an array:', data);
        setProceduresDetails([]);
        Alert.alert('Aviso', 'Nenhum local encontrado para o procedimento selecionado.');
      }
    } catch (err: any) {
      console.error('Error fetching procedure details:', err.message);
      if (err.response) {
        console.error('Error Response:', JSON.stringify(err.response.data, null, 2));
        console.error('Error Status:', err.response.status);
        if (err.response.status === 401) {
          Alert.alert('Aviso', 'Sessão expirada. Faça login novamente.');
        } else {
          Alert.alert('Aviso', 'Erro ao buscar dados. Tente novamente.');
        }
      } else {
        Alert.alert('Aviso', 'Erro de conexão. Verifique sua internet e tente novamente.');
      }
      setProceduresDetails([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    navigation.setOptions({
      title: route.params.procedimento.des_descricao_tpr, // Usando a descrição como título
      headerStyle: {
        backgroundColor: colors.primaryContainer,
      },
      headerTintColor: colors.onPrimaryContainer,
    });

    (async () => {
      // Passando o id_procedimento_tpr
      await fetchProcedureDetails(Number(route.params.procedimento.id_procedimento_tpr));
    })();
  }, [navigation, route.params.procedimento.id_procedimento_tpr]); // Adicionando a dependência

  return (
    <View style={[styles.container, { backgroundColor: colors.fundo }]}>
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
            <Animated.View
              style={{
                flex: 1,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}>
              <View style={{ flexDirection: 'row', marginHorizontal: 27, marginTop: 28 }}>
                {[1, 2, 3].map((_, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      height: 6,
                      marginRight: 15,
                      marginLeft: 15,
                      borderRadius: 5,
                      backgroundColor: index < 1 ? colors.primary : colors.onSecondary,
                    }}
                  />
                ))}
              </View>
              {/* ← Aqui está o fechamento correto da View de barra de progresso */}

              <View style={styles.contentContainer}>
                <ProcedureDetails procedures={proceduresDetails!} />
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
  },
  divider: {
    height: 1,
    marginVertical: 16,
    opacity: 0.5,
  },
  infoCard: {
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
});
