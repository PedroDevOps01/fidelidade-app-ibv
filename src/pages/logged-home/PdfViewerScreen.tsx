import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { WebView } from 'react-native-webview';
import { api } from '../../network/api';
import { useAuth } from '../../context/AuthContext';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { getAsyncStorageData, storeAsyncStorageData } from '../../repository/async-storage';

interface Termo {
  id_termo_declaracao_tde: number;
  des_descricao_tde: string;
  txt_texto_tde: string;
}

const PdfViewerScreen = () => {
  const { authData, setAuthData, clearAuthData } = useAuth();
  const { dadosUsuarioData, setPessoa } = useDadosUsuario();
  const [terms, setTerms] = useState<Termo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const isLogged = !!dadosUsuarioData.user.id_usuario_usr;

  // Termo de fallback
  const fallbackTerms: Termo[] = [
    {
      id_termo_declaracao_tde: 0,
      des_descricao_tde: 'Termos de Adesão Padrão',
      txt_texto_tde: 'Bem-vindo! Estes são os termos de adesão padrão. Por favor, leia atentamente antes de prosseguir.',
    },
  ];

  const generateRequestHeader = (token: string) => ({
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `bearer ${token}`,
    },
  });

  const loadTokenFromStorage = async () => {
    try {
      const authDataStored = await getAsyncStorageData('authorization', error => console.log('Erro ao carregar token do AsyncStorage:', error));
      if (authDataStored) {
        console.log('Token carregado do AsyncStorage:', authDataStored.access_token);
        setAuthData(authDataStored);
        return authDataStored.access_token;
      }
      console.log('Nenhum token encontrado no AsyncStorage.');
      return null;
    } catch (error) {
      console.log('Erro ao carregar token do AsyncStorage:', error);
      return null;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      if (!isLogged) {
        console.log('Usuário não logado, não é possível atualizar o token.');
        setError('Usuário não autenticado. Por favor, faça login novamente.');
        return null;
      }

      let token = authData.access_token;
      if (!token) {
        token = await loadTokenFromStorage();
        if (!token) {
          console.log('Nenhum token disponível para atualização.');
          setError('Token não encontrado. Por favor, faça login novamente.');
          return null;
        }
      }

      const request = await fetch('http://52.20.221.114/api/refresh', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `bearer ${token}`,
        },
      });

      if (request.status === 200) {
        const response = await request.json();
        const newToken = response.authorization.access_token;
        console.log('Token atualizado:', newToken);

        await storeAsyncStorageData(
          'authorization',
          response.authorization,
          () => console.log('Token salvo com sucesso no AsyncStorage'),
          error => console.log('Erro ao salvar token no AsyncStorage:', error),
        );

        setAuthData(response.authorization);
        return newToken;
      } else {
        console.log('Falha ao atualizar token, status:', request.status);
        setError('Falha ao atualizar autenticação. Tente novamente.');
        return null;
      }
    } catch (error) {
      console.log('Failed to refresh token:', error);
      setError('Erro ao atualizar autenticação. Tente novamente.');
      return null;
    }
  };

  async function fetchTerms(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      if (!isLogged) {
        setError('Usuário não autenticado. Por favor, faça login novamente.');
        setTerms(fallbackTerms);
        return;
      }

      let token = authData.access_token;

      if (!token) {
        const refreshedToken = await refreshToken();
        if (!refreshedToken) {
          setTerms(fallbackTerms);
          return;
        }
        token = refreshedToken; // Agora usando o novo token
      }

      const headers = generateRequestHeader(token);
      const response = await api.get('/termo-declaracao?is_adesao_tde=1&is_ativo_tde=1', headers);
      const dataApi = response.data;
      if (dataApi?.response?.data?.length > 0) {
        setTerms(dataApi.response.data);
      } else {
        setError('Nenhum termo de adesão encontrado.');
        setTerms(fallbackTerms);
      }
    } catch (error: any) {
      console.error('Erro ao buscar termos:', error.message, error.response?.data);
      if (error.response?.status === 401) {
        setError('Acesso negado. Tente novamente.');
        const refreshed = await refreshToken();
        if (refreshed) {
          fetchTerms(); // Tentar novamente após refresh
        } else {
          setTerms(fallbackTerms);
        }
      } else {
        setError('Erro ao carregar os termos de adesão.');
        setTerms(fallbackTerms);
      }
    } finally {
      setLoading(false);
    }
  }

  async function acceptTerms() {
    try {
      if (!isLogged) {
        setError('Usuário não autenticado. Por favor, faça login novamente.');
        return;
      }

      let token = authData.access_token;
      if (!token) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          return;
        }
        token = authData.access_token;
      }

      const idPessoa = dadosUsuarioData.pessoa?.id_pessoa_pes;
      if (!idPessoa) {
        setError('ID da pessoa não encontrado.');
        return;
      }

      const headers = generateRequestHeader(token);
      await api.put(`/pessoa/${idPessoa}`, { is_assinado_pes: 1 }, headers);
      setPessoa({ ...dadosUsuarioData.pessoa, is_assinado_pes: 1 });
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao aceitar termos:', error.message, error.response?.data);
      if (error.response?.status === 401) {
        setError('Acesso negado. Tente novamente.');
        const refreshed = await refreshToken();
        if (refreshed) {
          acceptTerms(); // Tentar novamente após refresh
        }
      } else {
        setError('Erro ao aceitar os termos. Tente novamente.');
      }
    }
  }

  useEffect(() => {
    const initialize = async () => {
      if (isLogged) {
        console.log('Usuário logado, tentando atualizar token...');
        await refreshToken(); // Chamar refresh assim que entrar na tela
      }
      fetchTerms();
    };
    initialize();
  }, [isLogged, authData]);

  const generateContractHtml = () => {
    let content = '';

    if (loading) {
      content = '<div class="loading-container"><div class="spinner"></div><p>Carregando termos...</p></div>';
    } else if (error) {
      content = `<div class="error-container"><p class="error-text">${error}</p></div>`;
    } else if (terms.length > 0) {
      content = terms
        .map(
          termo => `
            <div class="section">
              <h2 class="section-title">${termo.des_descricao_tde}</h2>
              ${termo.txt_texto_tde
                .split('\n')
                .map(line => `<p class="paragraph">${line.trim()}</p>`)
                .join('')}
            </div>
          `,
        )
        .join('');
    } else {
      content = '<div class="empty-container"><p>Nenhum termo de adesão disponível no momento.</p></div>';
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Montserrat', sans-serif;
            margin: 0;
            line-height: 1.8;
            color: #333;
            background: transparent;
          }
          
          .contract-container {
            max-width: 800px;
            margin: 20px auto;
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(45, 85, 155, 0.2);
          }
          
          h1 {
            font-size: 24px;
            font-weight: 700;
            color: #2d559b;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
          }
          
          .subtitle {
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
            letter-spacing: 0.3px;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-weight: 600;
            color: #2d559b;
            margin-bottom: 10px;
            font-size: 16px;
          }
          
          .paragraph {
            margin: 15px 0;
            text-align: justify;
            font-size: 15px;
            color: #495057;
          }
          
          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #6c757d;
            text-align: center;
            border-top: 1px solid rgba(45, 85, 155, 0.2);
            padding-top: 20px;
          }
          
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 0;
          }
          
          .spinner {
            border: 4px solid rgba(45, 85, 155, 0.1);
            border-radius: 50%;
            border-top: 4px solid #2d559b;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .error-container {
            padding: 30px;
            background: rgba(220, 53, 69, 0.1);
            border-radius: 8px;
            text-align: center;
          }
          
          .error-text {
            color: #dc3545;
            font-weight: 500;
          }
          
          .empty-container {
            padding: 30px;
            background: rgba(108, 117, 125, 0.1);
            border-radius: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="contract-container">
          <div class="header">
            <h1>TERMOS DE ADESÃO AO CARTÃO DE BENEFÍCIO</h1>
            <div class="subtitle">Documento válido e executável nos termos da legislação vigente</div>
          </div>
          ${content}
          <div class="footer">
            <p>Documento gerado eletronicamente em ${new Date().toLocaleDateString('pt-BR')} - Válido sem carimbo ou assinatura física</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <ImageBackground source={require('../../assets/images/welcome-illustration.png')} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <WebView originWhitelist={['*']} source={{ html: generateContractHtml() }} style={styles.webview} javaScriptEnabled={true} domStorageEnabled={true} />
        <View style={styles.buttonContainer}>
          {error ? (
            <>
              <Button mode="contained" onPress={fetchTerms} style={styles.button} labelStyle={styles.buttonText}>
                Tentar Novamente
              </Button>
              <Button mode="outlined" onPress={() => navigation.navigate('Login')} style={styles.button} labelStyle={styles.buttonText}>
                Fazer Login
              </Button>
            </>
          ) : (
            <Button mode="contained" onPress={acceptTerms} style={styles.button} labelStyle={styles.buttonText}>
              Continuar e Aceitar
            </Button>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
    marginVertical: 20,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(45, 85, 155, 0.2)',
  },
  button: {
    marginVertical: 5,
    borderRadius: 8,
    paddingVertical: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PdfViewerScreen;
