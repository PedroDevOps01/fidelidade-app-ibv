/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import AppRouter from './src/router/app-router';
import { LightTheme } from './src/themes/app-theme';
import { AuthProvider } from './src/context/AuthContext';
import { DadosUsuarioProvider } from './src/context/pessoa-dados-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserCartProvider } from './src/context/user-cart-context';
import { ConsultasProvider } from './src/context/consultas-context';
import { ExamesProvider } from './src/context/exames-context';
import { Toaster } from 'sonner-native';

function App(): React.JSX.Element {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={LightTheme}>
        <AuthProvider>
          <DadosUsuarioProvider>
            <ConsultasProvider>
              <ExamesProvider>
                <UserCartProvider>
                  <AppRouter />
                </UserCartProvider>
              </ExamesProvider>
            </ConsultasProvider>
          </DadosUsuarioProvider>
        </AuthProvider>
        <Toaster />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

export default App;
