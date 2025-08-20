import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Image, TouchableWithoutFeedback, Keyboard, Platform, ImageBackground, Dimensions } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { TextInput, Button, Card, Text, useTheme } from 'react-native-paper';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../network/api';
import { applyCnpjMask, applyCpfMask, generateRequestHeader, isValidCPF, removeAccents } from '../../utils/app-utils';
import { requestPermissions } from '../../utils/permissions';
import { useNetInfoInstance } from '@react-native-community/netinfo';
import { LoginSchema } from '../../form-objects/login-form-object';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { useAuth } from '../../context/AuthContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { reset } from '../../router/navigationRef';
import CustomToast from '../../components/custom-toast';
import ModalContainer from '../../components/modal';
import EsqueceuSenhaForm from './esqueceu-senha-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated } from 'react-native'; // Adicione esta importação no topo

const { width } = Dimensions.get('window');
const LAST_LOGGED_CPF_KEY = 'last_logged_cpf';

export default function LoginCheckCpf({ navigation, routeAfterLogin }: { navigation: any; routeAfterLogin: string }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isRecoverPassworrdModalVisible, setIsRecoverPassworrdModalVisible] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const toggleSecureEntry = () => setSecureTextEntry(!secureTextEntry);
  const { setAuthData, clearAuthData } = useAuth();
  const { setDadosUsuarioData, clearDadosUsuarioData } = useDadosUsuario();
  const {
    netInfo: { isConnected },
  } = useNetInfoInstance();
  const scaleAnim = useState(new Animated.Value(1))[0];

  type LoginFormType = z.infer<typeof LoginSchema>;
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { cpf: '', password: '' },
  });

  useEffect(() => {
    (async () => {
      try {
        await requestPermissions();
      } catch (err) {
        console.log('err', err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedCpf = await AsyncStorage.getItem(LAST_LOGGED_CPF_KEY);
        if (savedCpf) {
          const masked = savedCpf.length > 11 ? applyCnpjMask(savedCpf) : applyCpfMask(savedCpf);
          setValue('cpf', masked);
        }
      } catch (err) {
        console.log('Failed to load last logged CPF:', err);
      }
    })();
  }, [setValue]);

  const handleLogin = async (form: LoginFormType) => {
  setLoading(true);
  clearAuthData();
  clearDadosUsuarioData();

  const token = await AsyncStorage.getItem('device_token_id');
  const dataToSent = {
    cpf: removeAccents(form.cpf),
    hash_senha_usr: form.password,
  };

  try {
    if (dataToSent.cpf.length === 11 && !isValidCPF(dataToSent.cpf)) {
      CustomToast('CPF inválido!', colors);
      return;
    }

    if (dataToSent.cpf.length > 11 && dataToSent.cpf.length < 14) {
      CustomToast('CNPJ inválido!', colors);
      return;
    }

    const response = await api.post('/login', dataToSent);
    const loginData: LoginResponse = response.data;

    if (loginData.user.is_ativo_usr === 0) {
      CustomToast('Usuário inativo! Contate o suporte.', colors);
      return;
    }

    setAuthData(loginData.authorization);
    setDadosUsuarioData({
      pessoa: { ...loginData.user, cod_cpf_pes: dataToSent.cpf },
      pessoaDados: loginData.dados,
      pessoaAssinatura: loginData.assinatura,
      errorCadastroPagarme: loginData.errorCadastroPagarme,
      pessoaMdv: loginData.mdv,
      user: loginData.user,
    });

    if (token) {
      try {
        const deviceData = {
          id_pessoa_tdu: loginData.dados?.id_pessoa_pda,
          dispositivo_token_tdu: token,
          platforma_tdu: Platform.OS,
        };
        await api.post('/usuarioDevice', deviceData, generateRequestHeader(loginData.authorization.access_token));
      } catch (err) {
        console.error('Erro ao registrar dispositivo:', err);
        CustomToast('Erro ao registrar dispositivo. Continuando...', colors);
      }
    }

    await AsyncStorage.setItem(LAST_LOGGED_CPF_KEY, dataToSent.cpf);

    // Adicione um log para verificar se a navegação está sendo chamada
    console.log('Login bem-sucedido, redirecionando para:', routeAfterLogin);

    reset([{ name: routeAfterLogin }]);
  } catch (err) {
    console.error('Erro ao realizar login:', err);
    CustomToast('Erro ao consultar dados. Tente novamente mais tarde.', colors);
  } finally {
    setLoading(false);
  }
};

  return (
    <ImageBackground source={require('../../assets/images/fundologin.png')} style={styles.background} resizeMode="cover">
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
        <ModalContainer visible={isRecoverPassworrdModalVisible} handleVisible={() => setIsRecoverPassworrdModalVisible(false)}>
          <EsqueceuSenhaForm />
        </ModalContainer>

        <View style={styles.contentWrapper}>
          <View style={styles.logoContainer}>
  <Image
    source={require('../../assets/images/logonova1.png')}
    style={{ width: 150, height: 150, resizeMode: 'contain' }}
  />
</View>

          <Card style={[styles.card, { backgroundColor: colors.onSecondary }]} elevation={3}>
            <Card.Content>
              <Text variant="headlineSmall" style={[styles.title, { color: colors.primary }]}>
                Bem-vindo de volta!
              </Text>
              <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Entre com seus dados para acessar sua conta
              </Text>

              <View style={styles.formContainer}>
                <Controller
                  control={control}
                  name="cpf"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label="CPF ou CNPJ"
                      mode="outlined"
                      onChangeText={e => onChange(e.length > 14 ? applyCnpjMask(e) : applyCpfMask(e))}
                      value={value}
                      keyboardType="number-pad"
                      error={!!errors.cpf}
                      returnKeyType="next"
                      outlineColor={colors.outline}
                      activeOutlineColor={colors.primary}
                      left={<TextInput.Icon icon="account" />}
                      theme={{
                        colors: {
                          primary: colors.primary,
                          background: colors.onSecondary,
                        },
                        roundness: 12,
                      }}
                      onFocus={() => {
                        Animated.spring(scaleAnim, {
                          toValue: 1.02,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onBlur={() => {
                        Animated.spring(scaleAnim, {
                          toValue: 1,
                          useNativeDriver: true,
                        }).start();
                      }}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label="Senha"
                      mode="outlined"
                      onChangeText={onChange}
                      value={value}
                      error={!!errors.password}
                      secureTextEntry={secureTextEntry}
                      outlineColor={colors.outline}
                      activeOutlineColor={colors.primary}
                      left={<TextInput.Icon icon="lock" />}
                      right={<TextInput.Icon icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={toggleSecureEntry} color={colors.onSurfaceVariant} />}
                      theme={{
                        colors: {
                          primary: colors.primary,
                          background: colors.onSecondary,
                        },
                        roundness: 12,
                      }}
                      onFocus={() => {
                        Animated.spring(scaleAnim, {
                          toValue: 1.02,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onBlur={() => {
                        Animated.spring(scaleAnim, {
                          toValue: 1,
                          useNativeDriver: true,
                        }).start();
                      }}
                    />
                  )}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit(handleLogin)}
                  loading={loading}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  labelStyle={{ color: colors.onPrimary }}
                  contentStyle={styles.buttonContent}
                  disabled={!isConnected || loading}>
                  {loading ? 'Acessando...' : 'Entrar'}
                </Button>

                <View style={styles.linksContainer}>
                  <Button mode="text" onPress={() => setIsRecoverPassworrdModalVisible(true)} style={styles.linkButton} labelStyle={{ color: colors.primary }} compact>
                    Esqueci minha senha
                  </Button>
                  <Text style={[styles.dividerText, { color: colors.onSurfaceVariant }]}>|</Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('register-step-one', { tipo: 'NEW_USER' })}
                    style={styles.linkButton}
                    labelStyle={{ color: colors.primary }}
                    compact>
                    Criar conta
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>

          {!isConnected && (
            <View style={styles.connectionWarning}>
              <Text style={[styles.errorText, { color: colors.error }]}>Você está offline. Conecte-se à internet para continuar.</Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  contentWrapper: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
    borderRadius: 30,
    paddingVertical: 2,
  },
  buttonContent: {
    height: 48,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  linkButton: {
    marginHorizontal: 4,
  },
  dividerText: {
    marginHorizontal: 8,
  },
  connectionWarning: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  errorText: {
    textAlign: 'center',
  },
});
