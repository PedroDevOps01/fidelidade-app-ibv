import { RouteProp, useRoute } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Icon, Text, useTheme } from 'react-native-paper';
import { generateRequestHeader, maskBrazilianCurrency } from '../../utils/app-utils';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingFull from '../../components/loading-full';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import CustomToast from '../../components/custom-toast';
import ModalContainer from '../../components/modal';

type UserMdvWithdrawRouteParams = {
  params: {
    value: number;
    id_usario_mdv: number;
  };
};

type BankItem = {
  des_descricao_ban: string;
  cod_banco_ban: string;
  cod_agencia_pdb: string;
  cod_num_conta_pdb: string;
  des_tipo_pdb: string;
  is_ativo_pdb: number;
  cod_agencia_validador_pdb: string;
  cod_conta_validador_pdb: string;
  id_pessoa_banco_pdb: number;
};

export default function UserMdvWithdraw() {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<UserMdvWithdrawRouteParams, 'params'>>();
  const { value, id_usario_mdv } = route.params;

  const [loading, setLoading] = useState<boolean>(false);
  const { authData } = useAuth();
  const { dadosUsuarioData } = useDadosUsuario();
  const [bank, setBank] = useState<BankItem>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isWithdrawRequesting, setIsWithdrawRequesting] = useState<boolean>(false);

  const getDadosBanco = async () => {
    setLoading(true);
    let id_pessoa = dadosUsuarioData.pessoaDados?.id_pessoa_pes;

    if (!id_pessoa) {
      CustomToast('Erro ao obter dados bancários. Tente novamente mais tarde.', colors, 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/pessoa/banco/${id_pessoa}`, generateRequestHeader(authData.access_token));
      if (response.status === 200) {
        const { data } = response;
        if (data.response.data.length > 0) {
          setBank(data.response.data[0]);
        } else {
          CustomToast('Erro ao obter dados bancários. Nenhum dado bancário encontrado.', colors, 'error');
        }
      } else {
        CustomToast('Erro ao obter dados bancários. Nenhum dado bancário encontrado.', colors, 'error');
      }
    } catch (error) {
      CustomToast('Erro ao obter dados bancários. Nenhum dado bancário encontrado.', colors, 'error');
    } finally {
      setLoading(false);
    }
  };

  async function requestWithdraw() {
    setIsWithdrawRequesting(true);

    try {
      const response = await api.post(
        `/dashboard/transferir_saldo/${id_usario_mdv}`,
        {
          amount: value,
        },
        generateRequestHeader(authData.access_token),
      );

      if (response.status === 200) {
        if (response.data.data.original.error) {
          Alert.alert('Aviso', response.data.data.original.error ?? "Erro ao solicitar transferência. Tente novamente mais tarde.");
          return
        }

        //goBack()
      }
    } catch (error) {
      
    } finally {
      setIsWithdrawRequesting(false);
      setIsModalVisible(false);
    }
    CustomToast('Erro ao solicitar transferência. Tente novamente mais tarde.', colors, 'error');
  }

  useEffect(() => {
    getDadosBanco();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 }}>
      {loading ? (
        <LoadingFull />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ModalContainer handleVisible={() => setIsModalVisible(false)} visible={isModalVisible}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
              Solicitação de Transferência
            </Text>
            <Text style={{ textAlign: 'center', marginBottom: 16 }}>
              {`Você está solicitando a transferência de `}
              <Text style={{ fontWeight: 'bold' }}>
                R$: {maskBrazilianCurrency(value)}
                {'\n'}
              </Text>
              {` para a conta bancária selecionada.\nDeseja continuar?`}
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                requestWithdraw();
              }}
              style={{ marginBottom: 8 }}>
              {isWithdrawRequesting ? 'Aguarde...' : 'Confirmar Transferência'}
            </Button>
          </ModalContainer>

          <Card style={[styles.card, { backgroundColor: colors.surface, marginTop: 10 }]}>
            <Card.Content>
              <Text style={styles.title}>Valor a ser transferido:</Text>
              <Text style={styles.label}>{maskBrazilianCurrency(value)}</Text>
            </Card.Content>
          </Card>

          {bank && (
            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
              <Card.Content>
                <Text style={styles.title}>Dados para transferência</Text>

                <View style={styles.row}>
                  <Text style={styles.label}>Banco:</Text>
                  <Text style={styles.value}>{bank.des_descricao_ban}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Agência:</Text>
                  <Text style={styles.value}>{bank.cod_agencia_pdb}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Conta:</Text>
                  <Text style={styles.value}>
                    {bank.cod_num_conta_pdb}-{bank.cod_conta_validador_pdb}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Tipo:</Text>
                  <Text style={styles.value}>{bank.des_tipo_pdb}</Text>
                </View>
              </Card.Content>
            </Card>
          )}

          <Card style={[styles.card, { backgroundColor: colors.surface, borderColor: 'red', borderWidth: 1 }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.title, { textAlign: 'center', fontSize: 18 }]}>
                AVISO <Icon source="alert" color="red" size={20} />
              </Text>

              <Text style={{ textAlign: 'center', fontSize: 18 }}>Certifique-se de que os dados bancários estão corretos antes de solicitar a transferência.</Text>
              <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 18 }}>
                Ao solicitar a transferência, o valor será debitado da sua conta de vendas e creditado na conta bancária informada.
              </Text>
              <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 18 }}>
                É necessário ter acima de <Text style={{ fontWeight: 'bold' }}>R$: 5,00</Text> para solicitar a transferência.
              </Text>
              <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 18 }}>
                Será debitado uma taxa de <Text style={{ fontWeight: 'bold' }}>R$: 3,67</Text> para cada transferência solicitada.
              </Text>
              <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 18 }}>A transferência será processada em até 3 dias úteis.</Text>
            </Card.Content>
          </Card>

          <Button
            onPress={() => {
              setIsModalVisible(true);
            }}
            mode="contained"
            key={value > 0 ? 'enabled' : 'disabled'}
            style={{ marginTop: 16, marginBottom: 16 }}
            disabled={value > 500 || !bank}>
            Solicitar Transferência
          </Button>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    elevation: 0,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    width: 150,
  },
  value: {
    flex: 1,
  },
});
