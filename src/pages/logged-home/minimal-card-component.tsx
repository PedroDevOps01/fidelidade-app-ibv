import { ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { CardData } from './card_data';
import { Card, Paragraph, Title } from 'react-native-paper';
import { navigate } from '../../router/navigationRef';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MinimalCardComponent = ({ item, colors }: { item: CardData; colors: MD3Colors }) => {
  const { dadosUsuarioData } = useDadosUsuario();

  return (
    <Card
      style={[styles.card, { borderColor: colors.primary }]}
      mode="contained"
      onPress={() => {
        if ((item.route == 'user-telepet-screen' || item.route == 'user-telemed-screen') && !dadosUsuarioData.pessoaAssinatura?.assinatura_liberada) {
          navigate('new-contract-stack');
          return;
        }

        navigate(item.route!);
      }}>
      <Card.Cover source={item.imageUrl as ImageSourcePropType} style={{ backgroundColor: colors.surfaceVariant }} />
      <Card.Content>
      <Title style={{fontWeight: 'bold'}}>{item.title}</Title>
      <Paragraph>{item.description}</Paragraph>
      </Card.Content>

      {/* <Card.Content style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ height: 100, width: 100, backgroundColor: '#FFF', borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name={item.icon} size={50} color={colors.primary} />
        </View> */}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    minWidth: '100%',
    // maxWidth: 150,
    minHeight: 160,
    // maxHeight: 160,
    borderWidth: 0.3,
  },
});

export default MinimalCardComponent;
