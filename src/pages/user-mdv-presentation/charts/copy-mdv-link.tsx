import { Share, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

export default function CopyMdvLink({id}: {id: number}) {
  const { colors } = useTheme();

  const shareMessage = async () => {
    try {
      const result = await Share.share({
        message:`http://3.215.147.199/fidelidade-ajudda/planos/${id}`, // Alguns apps dão preferência para esse campo
      });

      if (result.action === Share.sharedAction) {
        console.log('Compartilhado com sucesso!');
      } else if (result.action === Share.dismissedAction) {
        console.log('Compartilhamento cancelado.');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <View style={{ height: 'auto', paddingVertical: 20, borderRadius: 12, padding: 12, overflow: 'hidden', backgroundColor: colors.surfaceVariant }}>
      {/* Título do gráfico */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginBottom: 10 }}>Meu link de venda</Text>

      <Button key={'get_all_money'} mode="contained" onPress={shareMessage}>
        Compartilhar link
      </Button>
    </View>
  );
}
