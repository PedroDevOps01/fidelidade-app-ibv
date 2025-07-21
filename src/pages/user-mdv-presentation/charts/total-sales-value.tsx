import { useWindowDimensions, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { generateRequestHeader, log, maskBrazilianCurrency } from '../../../utils/app-utils';
import { useEffect, useState } from 'react';
import { api } from '../../../network/api';
import { useDadosUsuario } from '../../../context/pessoa-dados-context';
import { useAuth } from '../../../context/AuthContext';
import CustomToast from '../../../components/custom-toast';
import { navigate } from '../../../router/navigationRef';

export default function TotalSalesValue({ salesData, currentMdv }: { salesData: Sale[]; currentMdv: number }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const { authData } = useAuth();

  const [availableAmount, setAvailableAmount] = useState<number>(0);

  console.log('currentMdv', currentMdv);

  async function getTotalSalesAvailable() {
    setLoading(true);
    setAvailableAmount(0)
    try {
      const response = await api.get(`/dashboard/saldo_conta_vendas/${currentMdv}`, generateRequestHeader(authData.access_token));

      if (response.status === 200) {
        const data = response.data;

        if (data.data.original.error) {
          CustomToast(`Erro ao obter dados de vendas: ${data.data.original.error}`, colors, 'error');
          return;
        }

        if (data.data.original.available_amount) {
          setAvailableAmount(data.data.original.available_amount);
          return
        }

      } else {
        console.error('Erro ao obter dados de vendas:', response);
      }

      console.log('Transferindo valor total de vendas...');
    } catch (error) {
      console.error('Erro ao transferir valor total de vendas:', error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    (async () => {
      await getTotalSalesAvailable();
    })();
  }, [currentMdv]);

  console.log('availableAmount', availableAmount);

  return (
    <View style={{
        height: "auto",
        paddingVertical: 20,
        borderRadius: 12,
        padding: 12,
        overflow: "hidden",
        backgroundColor: colors.surface,
      }}>
      {/* Título do gráfico */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginBottom: 10 }}>
        {availableAmount == 0 ? 'Sem vendas registradas!' : `Valor total disponível para saque \n${maskBrazilianCurrency(availableAmount)}`}
      </Text>

      <Button key={ availableAmount == 0 ? 'enabled' : 'disabled'} mode="contained" disabled={availableAmount == 0 ? true : false}
        onPress={() => {
          navigate('user-mdv-withdraw', { value: availableAmount, id_usario_mdv: currentMdv});
        }}
      >
        Transferir para minha conta
      </Button>
    </View>
  );
}
