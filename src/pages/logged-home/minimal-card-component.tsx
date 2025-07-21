import { ImageSourcePropType, StyleSheet, Dimensions } from 'react-native';
import { CardData } from './card_data';
import { Card } from 'react-native-paper';
import { navigate } from '../../router/navigationRef';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';
import { useDadosUsuario } from '../../context/pessoa-dados-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MinimalCardComponent = ({ item, colors }: { item: CardData; colors: MD3Colors }) => {
  const { dadosUsuarioData } = useDadosUsuario();

  return (
    <Card
      style={[styles.card, { borderColor: colors.onSurfaceVariant }]}
      mode="elevated"
      onPress={() => {
        if ((item.route === 'user-telepet-screen' || item.route === 'user-telemed-screen') && dadosUsuarioData.pessoaAssinatura?.assinatura_liberada) {
          navigate('new-contract-stack');
          return;
        }
        navigate(item.route!);
      }}>
      <Card.Cover
        source={item.imageUrl as ImageSourcePropType}
        style={styles.cardCover}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%', // Responsive width (70% of screen width)
    height: 200, // Fixed height for consistency
   
  },
  cardCover: {
    width: '100%',
    height: '100%', // Ensure the image fills the entire card
    backgroundColor: 'transparent',
  },
});

export default MinimalCardComponent;