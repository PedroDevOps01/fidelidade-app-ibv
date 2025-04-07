import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { getAsyncStorageData } from '../repository/async-storage';
import { initialAuthState, useAuth } from '../context/AuthContext';
import RegistrationRouter from './registration-router';
import { log, refreshNewToken } from '../utils/app-utils';
import { TokenNotFoundException } from '../exceptions/token-not-found-exception';
import { NoUserdataFoundException } from '../exceptions/no-userdata-found-exception';
import { CannotRefreshTokenException } from '../exceptions/cannot-refreshtoken-exception';
import { navigationRef, reset } from './navigationRef';
import LoadingFull from '../components/loading-full';
import { toast } from 'sonner-native';
import { DadosUsuario, useDadosUsuario } from '../context/pessoa-dados-context';

const AppRouter = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<any>(null);

  // Estado para gerenciar o carregamento
  const [isLoading, setIsLoading] = useState(true);
  const { setAuthData } = useAuth();

  const  { clearDadosUsuarioData, clearCreditCards, clearContracts } = useDadosUsuario()

  useEffect(() => {
    let isMounted = true;

    const checkInternalData = async () => {
      try {

        const userData = await getAsyncStorageData('user_data');
        log('userData', userData)

        if (userData.user.id_usuario_usr == 0) throw new NoUserdataFoundException('Sem usuário');

        const authData = await getAsyncStorageData('authorization');
        if (!authData) throw new TokenNotFoundException('Sem Token');

        const newTokenData: AuthorizationData =
          (await refreshNewToken(authData.access_token, () => {
            // Não vai mais redirecionar se perder o token
            //reset([{ name: 'check-cpf' }]);
            //toast.error('Sua sessão encerrou. Faça login novamente', {position: 'bottom-center'})
          })) ?? initialAuthState;
        if (newTokenData) setAuthData(newTokenData);

        if (isMounted) {
          setIsUserLoggedIn(userData);
        }
      } catch (error) {
        console.error('Erro ao verificar os dados do usuário:', error);

        if (error instanceof CannotRefreshTokenException) {
          clearContracts();
          clearCreditCards();
          clearDadosUsuarioData();
          toast.error('Sua sessão expirou. Faça login novamente', { position: 'bottom-center' });
        }

        if (isMounted) {
          setIsUserLoggedIn(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false); // Defina isLoading como false quando o processo for concluído
        }
      }
    };

    checkInternalData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingFull />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RegistrationRouter initialRoute={'logged-home-screen'} />
    </NavigationContainer>
  );
};

export default AppRouter;
