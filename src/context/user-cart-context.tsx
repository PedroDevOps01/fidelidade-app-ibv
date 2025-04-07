import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useReducer, useState } from 'react';
import { useDadosUsuario } from './pessoa-dados-context';
import { log, toPreciseInteger } from '../utils/app-utils';

// Ações do carrinho
type Action =
  | { type: 'ADD_ITEM_TO_CART'; payload: ProdutoParceiroResponse }
  | { type: 'REMOVE_ITEM_FROM_CART'; payload: { id: number } }
  | { type: 'LOAD_CART'; payload: UserCart }
  | { type: 'SET_USER_ID'; payload: number };

// Chave de armazenamento do AsyncStorage
const CART_STORAGE_KEY = '@user_cart';

// Contexto do Carrinho
const UserCartContext = createContext<{
  cart: UserCart;
  addItemToCart: (item: ProdutoParceiroResponse) => void;
  removeItemFromCart: (id: number) => void;
  clearCart: () => void;
}>({
  cart: {
    id_user: 0,
    dta_updated_cart: '',
    items_cart: [],
    total_cart_value: 0,
  },
  addItemToCart: () => {},
  removeItemFromCart: () => {},
  clearCart: () => {},
});

// Reducer do carrinho
const userCartReducer = (cart: UserCart, action: Action): UserCart => {
  switch (action.type) {
    case 'ADD_ITEM_TO_CART': {
      const updatedItems = [...cart.items_cart, action.payload];
      const updatedTotal = cart.total_cart_value + toPreciseInteger(Number(action.payload.vlr_produto_ppc));

      return {
        ...cart,
        items_cart: updatedItems,
        total_cart_value: updatedTotal,
        dta_updated_cart: new Date().toISOString(),
      };
    }

    case 'REMOVE_ITEM_FROM_CART': {


      const updatedItems = cart.items_cart.filter((_, index) => index !== action.payload.id);
      
      
      
      
      const updatedTotal = updatedItems.reduce((acc, item) => acc + Number(item.vlr_produto_ppc), 0);

      return {
        ...cart,
        items_cart: updatedItems,
        total_cart_value: updatedTotal,
        dta_updated_cart: new Date().toISOString(),
      };
    }

    case 'LOAD_CART': {
      return { ...cart, ...action.payload };
    }

    case 'SET_USER_ID': {
      const data = { ...cart, id_user: action.payload };

      return data;
    }

    default:
      return cart;
  }
};

// UserCartProvider
export const UserCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { dadosUsuarioData } = useDadosUsuario();

  const [cartInitialized, setCartInitialized] = useState(false); // Estado para verificar a inicialização
  const [cart, dispatch] = useReducer(userCartReducer, {
    id_user: dadosUsuarioData.user.id_usuario_usr,
    dta_updated_cart: '',
    items_cart: [],
    total_cart_value: 0,
  });

  // Carregar carrinho e setar ID do usuário no primeiro carregamento
  useEffect(() => {
    (async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        const parsedCart: UserCart = storedCart
          ? JSON.parse(storedCart)
          : {
              id_user: dadosUsuarioData.user.id_usuario_usr,
              dta_updated_cart: '',
              items_cart: [],
              total_cart_value: 0,
            };

        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (err) {
        console.error('Erro ao carregar o carrinho:', err);
      } finally {
        setCartInitialized(true); // Marcar como inicializado
      }

      if (dadosUsuarioData.user && dadosUsuarioData.user.id_usuario_usr) {
        dispatch({
          type: 'SET_USER_ID',
          payload: dadosUsuarioData.user.id_usuario_usr,
        });
      }
    })();
  }, [dadosUsuarioData.user]);

  const addItemToCart = async (item: ProdutoParceiroResponse) => {
    try {
      const updatedItems = [...cart.items_cart, item];
      const updatedTotal = updatedItems.reduce((acc, item) => {
        // console.log(acc, toPreciseInteger(Number(item.vlr_produto_ppc)))
        return acc + toPreciseInteger(Number(item.vlr_produto_ppc));
      }, 0);

      const updatedCart: UserCart = {
        ...cart,
        items_cart: updatedItems,
        total_cart_value: updatedTotal,
        dta_updated_cart: new Date().toISOString(),
      };

      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      dispatch({ type: 'ADD_ITEM_TO_CART', payload: item });
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
    }
  };

  const removeItemFromCart = async (itemIdx: number) => {
    try {
      const updatedItems = cart.items_cart.filter((_, index) => index != itemIdx);

      const updatedTotal = updatedItems.reduce((acc, item) => acc + Number(item.vlr_produto_ppc), 0);

      const updatedCart: UserCart = {
        ...cart,
        items_cart: updatedItems,
        total_cart_value: updatedTotal,
        dta_updated_cart: new Date().toISOString(),
      };

      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      dispatch({ type: 'REMOVE_ITEM_FROM_CART', payload: { id: itemIdx } });
    } catch (err) {
      console.error('Erro ao remover item:', err);
    }
  };

  const clearCart = () => {
    dispatch({ type: 'LOAD_CART', payload: cart });
    AsyncStorage.removeItem(CART_STORAGE_KEY);
  };

  if (!cartInitialized) return null; // Evitar renderização antes da inicialização

  return <UserCartContext.Provider value={{ cart, addItemToCart, removeItemFromCart, clearCart }}>{children}</UserCartContext.Provider>;
};

// Hook para consumir o contexto
export const useUserCart = () => {
  const context = useContext(UserCartContext);
  if (!context) {
    throw new Error('useUserCart deve ser usado dentro de UserCartProvider');
  }
  return context;
};
