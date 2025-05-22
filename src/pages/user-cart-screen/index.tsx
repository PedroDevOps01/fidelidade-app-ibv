import { FlatList, Image, StyleSheet, View, ScrollView } from 'react-native';
import { useUserCart } from '../../context/user-cart-context';
import { Button, Card, IconButton, Text, Title, useTheme } from 'react-native-paper';
import { log, maskBrazilianCurrency } from '../../utils/app-utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { navigate } from '../../router/navigationRef';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const UserCartScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { cart, removeItemFromCart } = useUserCart();
  const { dadosUsuarioData } = useDadosUsuario();
  const { colors } = useTheme();

  const renderItem = ({ item, index }: { item: ProdutoParceiroResponse; index: number }) => (
    <Card mode="contained" style={[styles.card]} onPress={() => navigation.navigate('user-produtos-screen-details', { item })}>
      <View style={styles.cardContent}>
        <Image source={{ uri: item.url_img_produto_ppc }} style={styles.image} />

        <View style={styles.infoContainer}>
          <Title style={styles.productTitle} numberOfLines={3}>
            {item.des_nome_produto_ppc}
          </Title>
          {item.obs_item_crt ? <Text>Observação: {item.obs_item_crt}</Text> : null}

          <Text>R$ {maskBrazilianCurrency(item.vlr_produto_ppc)}</Text>
        </View>

        <IconButton icon="trash-can-outline" iconColor={colors.onErrorContainer} size={30} onPress={() => removeItemFromCart(index)} />
      </View>
    </Card>
  );

  const handleFinalizarBtnPress = () => {
    if (!dadosUsuarioData.pessoaDados?.id_pessoa_pes) {
      navigate('user-login-screen-shopping');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (dadosUsuarioData.pessoaDados?.id_pessoa_pes) {
      }
    }, [dadosUsuarioData]),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cart.items_cart}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        removeClippedSubviews={false}
      />

      <View style={styles.footer}>
        <Button mode="contained" onPress={() => navigation.navigate('user-produtos-screen')} style={styles.addButton}>
          {`Adicionar${cart.items_cart.length >= 1 ? ' mais ' : ' '}itens    `}
          <Icon name="plus" size={14} />
        </Button>

        {/* <Text style={styles.totalText}>Total: R$ {maskBrazilianCurrency(cart.total_cart_value)}</Text>
         */}
        <Button mode="contained" key={'finalize_byu'} onPress={handleFinalizarBtnPress} disabled={cart.items_cart.length === 0} style={{ width: 'auto' }}>
          {`Finalizar Compra R$ ${maskBrazilianCurrency(cart.total_cart_value)}`}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  list: {
    paddingVertical: 16,
  },
  card: {
    flex: 1,
    marginVertical: 8,
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 12,
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 40,
  },
  totalContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addButton: {
    marginBottom: 16,
  },
});

export default UserCartScreen;
