import {useNavigation} from '@react-navigation/native';
import {Dimensions, StyleSheet, TouchableHighlight, useColorScheme} from 'react-native';
import {Card, Text, Title, useTheme} from 'react-native-paper';
import {maskBrazilianCurrency} from '../../utils/app-utils';

const ContratoCard = ({item}: {item: ContratoResponse}) => {
  const theme = useTheme();

  const navigation = useNavigation<ContratosNavigationProp>();

  const handlePress = () => {
    navigation.navigate('contrato-details', {
      data: {...item, title: `Contrato Nº: ${item.id_contrato_ctt} - ${item.des_nome_pla}`},
    });
  };

  return (
    <TouchableHighlight onPress={handlePress} style={{borderRadius: 0}}>
      <Card
        style={[styles.card, {backgroundColor: theme.colors.background}]}>
        <Card.Content>
          <Title style={[styles.title, {color: theme.colors.primary}]}>
            {`Contrato Nº: ${item.id_contrato_ctt} - ${item.des_nome_pla}`}
          </Title>
          <Text>R$: {maskBrazilianCurrency(item.vlr_inicial_ctt)}</Text>
          <Text>Parcelas: {item.qtd_parcelas_ctt}</Text>
        </Card.Content>
      </Card>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 0,
    width: '100%',
    shadowColor: 'transparent'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default ContratoCard;
