import {Dimensions, Image, StyleSheet, TouchableHighlight, useColorScheme, View} from 'react-native';
import {Card, Text, Title, useTheme} from 'react-native-paper';
import {maskBrazilianCurrency} from '../../utils/app-utils';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

type navigationProps = NativeStackNavigationProp<{
  'parceiro-produto-router': {id_produto_parceiro_ppc: number};
}>;

const ProdutoCard = ({item}: {item: ProdutoParceiroResponse}) => {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);
  const navigation = useNavigation<navigationProps>();

  const handlePress = () => {
    navigation.navigate('parceiro-produto-router', {
      id_produto_parceiro_ppc: item.id_produto_parceiro_ppc,
    });
  };

  return (
    <TouchableHighlight onPress={handlePress} style={{borderRadius: 0}}>
      <Card style={[styles.card, {backgroundColor: theme.colors.background}]}>
        <Card.Content style={{flexDirection: 'row'}}>
          <View style={{flex: 2}}>
            <Image
              source={{uri: item.url_img_produto_ppc}}
              style={styles.image}
              resizeMethod="resize"
              onError={() => {
                console.log('rr');
              }}
            />
          </View>
          <View style={{flexDirection: 'column', flex: 6, marginLeft: 10}}>
            <Title style={[styles.title, {color: theme.colors.primary}]}>{item.des_nome_produto_ppc}</Title>
            <Text>R$: {maskBrazilianCurrency(item.vlr_produto_ppc)}</Text>
          </View>
          <View style={{flex: 2, justifyContent: 'center', alignContent: 'center'}}>
            <Icon name={item.is_ativo_ppc ? 'check' : 'slash'} color={item.is_ativo_ppc ? 'green' : 'red'} size={30} />
            <Text>{item.is_ativo_ppc ? 'Ativo' : 'Inativo'}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 0
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
});

export default ProdutoCard;
