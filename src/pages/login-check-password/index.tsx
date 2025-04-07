import React, { useState } from 'react';
import { Alert, Image, StyleSheet, View, Keyboard } from 'react-native';
import { Button, Card, Text, TextInput, useTheme } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../../context/AuthContext';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { api } from '../../network/api';
import { reset } from '../../router/navigationRef';

const LoginCheckPassword = ({ route, navigation, routeAfterLogin }: { route: any; navigation: any, routeAfterLogin: string }) => {
  const theme = useTheme();
  const { cod_cpf_pes } = route.params;

  console.log(route.params)

  const { setAuthData } = useAuth();
  const { setDadosUsuarioData } = useDadosUsuario();

  const [password, setPassWord] = useState<string>('');
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [passwordErrorText, setPasswordErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);

  const toggleSecureEntry = () => setSecureTextEntry(!secureTextEntry);

  const handleSubmit = async () => {
    setPasswordErrorText(null);
    setLoading(true);

    console.log({
      cpf: cod_cpf_pes,
      hash_senha_usr: password,
    })

    if (password === '') {
      setIsPasswordError(true);
      setPasswordErrorText('A senha é obrigatória!');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/login', {
        cpf: cod_cpf_pes,
        hash_senha_usr: password,
      });

      

      const loginData: LoginResponse = response.data;

      // Handle successful login
      setAuthData(loginData.authorization);
      setDadosUsuarioData({
        pessoa: { ...loginData.user, cod_cpf_pes },
        pessoaDados: loginData.dados,
        pessoaAssinatura: loginData.assinatura,
        errorCadastroPagarme: loginData.errorCadastroPagarme,
        user: loginData.user
      });

      //navigation.navigate('logged-home-screen');
      reset([{name: routeAfterLogin}])
    } catch (err: any) {
      const statusCode = err.response?.status;
      if (statusCode === 401) {
        setLoading(false);
        setPassWord('');
        setPasswordErrorText('Senha Incorreta!');
        setIsPasswordError(true);
      } else {
        setLoading(false);
        Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      <View style={[styles.innerContainer, { backgroundColor: theme.colors.background }]}>
        <Image source={require('../../assets/images/fidelidade_logo.png')} style={styles.logo} />
        <Card mode="contained" style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Insira sua senha
            </Text>

            <TextInput
              label="Senha"
              mode="outlined"
              value={password}
              onChangeText={setPassWord}
              error={isPasswordError}
              style={styles.input}
              secureTextEntry={secureTextEntry}
              right={<TextInput.Icon icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={toggleSecureEntry} />}
              keyboardType="ascii-capable"
              returnKeyType="next"
            />
            {isPasswordError && (
              <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>{passwordErrorText}</Text>
            )}

            <Button
              key={loading ? 'disabled' : 'enabled'}
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
              contentStyle={{ height: 48 }}
            >
              {loading ? 'Aguarde' : 'Continuar'}
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  card: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    borderRadius: 5,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default LoginCheckPassword;
