import { Card, Text, useTheme } from 'react-native-paper';
import { maskBrazilianCurrency } from '../../utils/app-utils';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';
import { Image } from 'react-native';

interface ProdutoCardProps {
  item: ProdutoParceiroResponse;
  navigation: any;
  colors: MD3Colors;
}

const ProdutoCard = ({ item, navigation }: ProdutoCardProps) => {
  const { colors } = useTheme();
  return (
    <Card 
      onPress={() => navigation.navigate('user-produtos-screen-details', { item })}
      style={{ height: 350,  margin: 4, borderRadius: 0, borderColor: colors.primary }} 
      mode="outlined"
    >
      <Image source={{ uri: item.url_img_produto_ppc, height: 200, width: 200 }}  resizeMode="contain" />

      <Card.Title
        title={item.des_nome_produto_ppc}
        titleNumberOfLines={2}
        titleStyle={{ fontSize: 16, fontWeight: '600' }}
      />

      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
          R$ {maskBrazilianCurrency(item.vlr_produto_ppc)}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {item.nome_categoria_cpp}
        </Text>
      </Card.Content>
    </Card>
  );
};

export default ProdutoCard;
