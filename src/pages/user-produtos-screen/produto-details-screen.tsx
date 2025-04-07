import { useEffect, useState } from 'react';
import { Image, StatusBar, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import ImageViewing from 'react-native-image-viewing';
import { maskBrazilianCurrency } from '../../utils/app-utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserCart } from '../../context/user-cart-context';

const ProdutoDetailsScreen = ({route, navigation}: {route: any; navigation: any}) => {
  const {colors} = useTheme();
  const {cart, addItemToCart} = useUserCart();

  const {item}: {item: ProdutoParceiroResponse} = route.params;

  const [visible, setVisible] = useState<boolean>(false);
  const [statusBarTransparent, setStatusBarTransparent] = useState<boolean>(true);
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  useEffect(() => {
    if (visible) {
      setStatusBarTransparent(false);
    } else {
      setStatusBarTransparent(true);
    }
  }, [visible]);

  return (
    <>
      <StatusBar
        translucent={statusBarTransparent ? true : false}
        backgroundColor={statusBarTransparent ? 'transparent' : 'black'}
      />

      <ImageViewing
        images={[{uri: item.url_img_produto_ppc}]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />

      <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={() => setVisible(true)}>
            <Image source={{uri: item.url_img_produto_ppc}} style={styles.thumbnail} resizeMode="cover" />
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              style={[styles.backButton, {backgroundColor: colors.background}]}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.detailContainer, {backgroundColor: colors.background}]}>
          <Text style={styles.detailTitle}>{item.des_nome_produto_ppc}</Text>
          <Text style={styles.detailDescription}>{item.desc_produto_ppc}</Text>
          <Text style={styles.detailValue}>R$: {maskBrazilianCurrency(item.vlr_produto_ppc)}</Text>
        </View>

        <View style={[styles.detailContainer, {backgroundColor: colors.background}]}>
          <Text style={{fontSize: 18}}>Vendido por:</Text>
          <Text style={{fontSize: 20}}>{item.des_nome_fantasia_prc}</Text>
          <Button
            mode="contained"
            style={{marginVertical: 14}}
            onPress={() => {
              navigation.navigate('user-produtos-screen', {vendor: item.des_nome_fantasia_prc});
            }}>
            Ver mais deste vendedor{'   '}
            <Icon name="arrow-right" size={14} />
          </Button>
        </View>

        <View style={[styles.detailContainer, {backgroundColor: colors.background}]}>
          <Text>Adicionar observação</Text>
          <TextInput
            label={'Observação'}
            mode="outlined"
            multiline
            maxLength={140}
            value={itemDescription}
            onChangeText={e => setItemDescription(e)}
            style={{marginTop: 4}}
          />
        </View>
        <View
          style={[
            styles.detailContainer,
            {
              backgroundColor: colors.background,
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
          ]}>
          <View
            style={{
              flex: 3,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <IconButton
              icon="minus"
              size={11}
              onPress={() => setItemQuantity(prev => Math.max(1, prev - 1))}
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.background,
                  top: 0,
                  left: 0,
                  position: 'static',
                },
              ]}
            />

            <Text style={styles.itemCount}>{itemQuantity}</Text>

            <IconButton
              icon="plus"
              size={11}
              onPress={() => setItemQuantity(prev => prev + 1)}
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.background,
                  top: 0,
                  left: 0,
                  position: 'static',
                },
              ]}
            />
          </View>
          <View style={{flex: 7}}>
            <Button
              mode="contained"
              onPress={() => {
                for (let i = 1; i <= itemQuantity; i++) {
                  addItemToCart({...item, obs_item_crt: itemDescription});
                }
                navigation.goBack();
              }}>
              Adicionar
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1, // Faz o conteúdo crescer e empurra o final para o fim
    justifyContent: 'space-between', // Empurra a última View para o final
    paddingBottom: 16, // Adiciona espaço no fim da tela
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  detailContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    borderBottomColor: '#e0e0e0',
  },
  detailTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  detailDescription: {
    marginTop: 10,
    textAlign: 'justify',
  },
  detailValue: {
    marginTop: 10,
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
  },
  itemCount: {
    fontSize: 25,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  quantityContainer: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: 'transparent',
  },
});

export default ProdutoDetailsScreen;
