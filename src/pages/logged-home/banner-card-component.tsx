import { Card, Paragraph, Title } from "react-native-paper";
import { PromotionCard } from "./promotion_data";
import { ImageSourcePropType, StyleSheet } from "react-native";
import { navigate } from "../../router/navigationRef";
import { MD3Colors } from "react-native-paper/lib/typescript/types";

const BannerHorizontalItem = ({ item, colors }: { item: PromotionCard, colors: MD3Colors }) => (
  <Card
    mode="contained"
    style={[styles.cardVertical]}
    onPress={() => {
      navigate(item.route);
    }}>
    <Card.Cover source={item.imageUrl as ImageSourcePropType} style={{ backgroundColor: colors.surfaceVariant }} />
    <Card.Content>
      <Title>{item.title}</Title>
      <Paragraph>{item.description}</Paragraph>
    </Card.Content>
  </Card>
);



const styles = StyleSheet.create({
  cardVertical: {
    minWidth: 310,
    maxWidth: 310,
    
  },
})


export default BannerHorizontalItem