import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDadosUsuario } from '../context/pessoa-dados-context';
import { useTheme } from 'react-native-paper';
import { CreateMdvProvider } from '../context/createMdvContext';
import NoMdvFound from '../pages/user-mdv-presentation/no-mdv-found';
import UserMdvHome from '../pages/user-mdv-presentation/user-mdv-home';
import UserMdvRegistration from '../pages/user-mdv-presentation/user-mdv-registration';
import UserMdvBankList from '../pages/user-mdv-presentation/user-mdv-bank-list';
import UserMdvSalesDetails from '../pages/user-mdv-presentation/user-mdv-sales-details';
import UserMdvTerms from '../pages/user-mdv-presentation/user-mdv-terms';
import { NewContractStackNavigator } from './new-contract-stack-navigator';
import UserMdvWithdraw from '../pages/user-mdv-presentation/user-mdv-withdraw';

const MdvStack = createNativeStackNavigator();

export const MdvStackNavigator = () => {
  const { dadosUsuarioData } = useDadosUsuario();
  const { colors } = useTheme();
  const initialRouteName = dadosUsuarioData.pessoaMdv ? 'user-mdv-home' : 'no-mdv-found';

  return (
    <CreateMdvProvider>
      <MdvStack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerBackTitle: 'Voltar',
          headerTintColor: colors.onSurface,
        }}>
        <MdvStack.Screen name="no-mdv-found" component={NoMdvFound} options={{ headerShown: false }} />
        <MdvStack.Screen name="user-mdv-home" component={UserMdvHome} options={{ headerShown: false }} />
        <MdvStack.Screen name="user-mdv-registration" component={UserMdvRegistration} options={{ title: 'Dados bancários' }} />
        <MdvStack.Screen name="user-mdv-terms" component={UserMdvTerms} options={{ title: 'Termos de uso' }} />
        <MdvStack.Screen name="user-mdv-bank-list" component={UserMdvBankList} options={{ title: 'Dados bancários' }} />
        <MdvStack.Screen name="new-contract-navigator" component={NewContractStackNavigator} options={{ headerShown: false }} />
        <MdvStack.Screen name="user-mdv-sales-details" component={UserMdvSalesDetails} options={{ headerShown: true, title: 'Minhas vendas' }} />
        <MdvStack.Screen name="user-mdv-withdraw" component={UserMdvWithdraw} options={{ headerShown: true, title: 'Transferência' }} />
        
      </MdvStack.Navigator>
    </CreateMdvProvider>
  );
};
