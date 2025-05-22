import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Badge,
  Button,
  IconButton,
  Menu,
  Text,
  useTheme,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '../../network/api';
import ProdutoCard from './produto-card';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserCart } from '../../context/user-cart-context';
import CategoryModal from './category-modal';
import { RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const UserProdutosScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const {colors} = useTheme();
  const {authData} = useAuth();
  const {cart} = useUserCart();

  const [data, setData] = useState<ApiResponse<ProdutoParceiroResponse> | null>(
    null,
  );
  const [loadingScreen, setLoadingScreen] = useState<boolean>(true);
  const [url, setUrl] = useState<string>('/produto-parceiro?is_ativo_ppc=1');
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);

  useEffect(() => {
    if (route.params && route.params.vendor) {
      setUrl(
        `/produto-parceiro?is_ativo_ppc=1&des_nome_fantasia_prc=${route.params.vendor}`,
      );
    }
  }, [route.params]);

  // const bottomSheetRef = useRef<BottomSheet>(null);

  // const openBottomSheet = () => {
  //   bottomSheetRef.current?.expand();
  // };

  function handleUrlChanges(ids: number[]) {
    

    if (ids.length > 0) {
      const categoriesParams = ids.join('&id_categoria_ppc=').replace(' ', '');

      setUrl(`${url}&id_categoria_ppc=${categoriesParams}`);
    } else {
      setUrl('/produto-parceiro?is_ativo_ppc=1');
    }
  }

  useEffect(() => {
    (async () => {
      requestProdutos();
    })();
  }, [url]);

  useFocusEffect(() => {
    // Adicionando um item no header dinamicamente após a tela carregar
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.iconContainer}>
          <IconButton
            icon="cart"
            size={24}
            onPressIn={() => {
              console.log('ive been pressed')
              navigation.navigate('user-cart-screen')
            }}
          />
          {cart.items_cart.length > 0 && (
            <Badge 
              //onPress={() => navigation.navigate('user-cart-screen')} 
              style={styles.badge}
              >{cart.items_cart.length}</Badge>
          )}
        </View>
      ),
    });
  });

  const ButtonFiltersBar = () => {
    const [filterListVisible, setFilterListVisible] = useState<boolean>(false);

    return (
      <View
        style={{flexDirection: 'row', marginVertical: 4, marginHorizontal: 6}}>
        <Menu
          visible={filterListVisible}
          onDismiss={() => setFilterListVisible(false)}
          anchor={
            <Button
              onPress={() => {
                setFilterListVisible(true);
              }}>
              Preço
            </Button>
          }>
          <Menu.Item
            onPress={() => {setUrl(`${url}&direction=desc`)}}
            title="Maior preço"
            trailingIcon={() => <Icon name="arrow-top-right-thin" size={20} />}
          />
          <Menu.Item
            onPress={() => {setUrl(`${url}&direction=asc`)}}
            title="Menor preço"
            trailingIcon={() => (
              <Icon name="arrow-bottom-right-thin" size={20} />
            )}
          />
        </Menu>
        <Button onPress={() => setShowCategoryModal(true)}>Categorias</Button>
      </View>
    );
  };

  async function requestProdutos() {
    setLoadingScreen(true);
    
    try {
      const request = await api.get(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      const {data} = request;
      //console.log(JSON.stringify(data, null, 2));
      setData(data);
    } catch (err: any) {
      console.log(err.response);
    } finally {
      setLoadingScreen(false);
    }
  }

  return (
    <>
      {loadingScreen ? (
        <View
          style={[
            styles.loadingContainer,
            {backgroundColor: colors.background},
          ]}>
          <ActivityIndicator size={40} style={{marginBottom: 20}} />
          <Text>Carregando...</Text>
        </View>
      ) : (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
          <CategoryModal
            onDismiss={() => setShowCategoryModal(false)}
            colors={colors}
            showCategoryModal={showCategoryModal}
            access_token={authData.access_token}
            onSubmit={ids => {
              handleUrlChanges(ids);
            }}
          />
          <ButtonFiltersBar />

          <FlatList
            data={data?.response.data}
            renderItem={({item}) => (
              <ProdutoCard
                item={item}
                navigation={navigation}
                colors={colors}
              />
            )}
            contentContainerStyle={{alignItems: 'center'}}
            keyExtractor={item => item.id_produto_parceiro_ppc.toString()}
            numColumns={2}
            style={{
              width: '100%',
              backgroundColor: colors.background,
            }}
            refreshControl={
              <RefreshControl
                refreshing={loadingScreen}
                onRefresh={() => {
                  requestProdutos();
                }}
              />
            }
            removeClippedSubviews={false}
          />

          {/* <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={['10%', '30%']}
            enablePanDownToClose
            enableDynamicSizing
            handleIndicatorStyle={{backgroundColor: colors.primary}}
            handleStyle={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 14,
            }}>

            <BottomSheetView
              style={[
                styles.sheetContent,
                {backgroundColor: colors.background},
              ]}>
              <Text>Este é o conteúdo do Bottom Sheet!</Text>
            </BottomSheetView>


          </BottomSheet> */}
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Garante que a ScrollView ocupe todo o espaço disponível
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'red',
    color: 'white',
  },
  modalView: {
    backgroundColor: 'white',
    marginHorizontal: '5%',
    padding: 10,
    height: 'auto',
  },
});

export default UserProdutosScreen;
