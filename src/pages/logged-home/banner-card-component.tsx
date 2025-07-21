import { Card, Paragraph, Title } from 'react-native-paper';
import { PromotionCard } from './promotion_data';
import { ImageSourcePropType, StyleSheet, Dimensions } from 'react-native';
import { navigate } from '../../router/navigationRef';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BannerHorizontalItem = ({ item, colors }: { item: PromotionCard; colors: MD3Colors }) => (
  <Card
    mode="elevated"
    style={[styles.card, { borderColor: colors.onSurfaceVariant }]}
    onPress={() => {
      navigate(item.route);
    }}>
    <Card.Cover
      source={item.imageUrl as ImageSourcePropType}
      style={styles.cardCover}
      resizeMode="cover" // Ensure the image fills the card
    />
 
  </Card>
);

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

export default BannerHorizontalItem;