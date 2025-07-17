import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, StyleSheet, Alert, Image, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { TextInput, Button, Card, Text, useTheme } from 'react-native-paper';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../network/api';
import { applyCnpjMask, applyCpfMask, generateRequestHeader, isValidCPF, log, removeAccents } from '../../utils/app-utils';
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

const LAST_LOGGED_CPF_KEY = 'last_logged_cpf';

export default function LoginCheckCpf({ navigation, routeAfterLogin }: { navigation: any; routeAfterLogin: string }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecoverPassworrdModalVisible, setIsRecoverPassworrdModalVisible] = useState<boolean>(false);
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const toggleSecureEntry = () => setSecureTextEntry(!secureTextEntry);
  const { setAuthData, clearAuthData } = useAuth();
  const { setDadosUsuarioData, clearDadosUsuarioData } = useDadosUsuario();
  const {
    netInfo: { isConnected },
  } = useNetInfoInstance();

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
          const masked =
            savedCpf.length > 11 ? applyCnpjMask(savedCpf) : applyCpfMask(savedCpf);
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

    let dataToSent = {
      cpf: removeAccents(form.cpf),
      hash_senha_usr: form.password,
    };

    try {
      if (dataToSent.cpf.length == 11 && !isValidCPF(dataToSent.cpf)) {
        CustomToast('CPF inválido!', colors);
        return;
      }

      if (dataToSent.cpf.length > 11 && dataToSent.cpf.length < 14) {
        CustomToast('CNPJ inválido!', colors);
        return;
      }

      const response = await api.post('/login', dataToSent);
      const loginData: LoginResponse = response.data;


      if(loginData.user.is_ativo_usr == 0) {
        CustomToast('Usuário inativo! Contate o suporte.', colors);
        return
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

      const deviceData = {
        id_pessoa_tdu: loginData.dados?.id_pessoa_pda,
        dispositivo_token_tdu: token,
        platforma_tdu: Platform.OS,
      };

      if (token) {
        //enviar dados do device
        await api.post('/usuarioDevice', deviceData, generateRequestHeader(loginData.authorization.access_token));
      }
      try {
        await AsyncStorage.setItem(LAST_LOGGED_CPF_KEY, dataToSent.cpf);
      } catch (err) {
        console.log('Failed to save last logged CPF:', err);
      }
      reset([{ name: routeAfterLogin }]);
    } catch (err) {
      console.log(err);
      CustomToast('Erro ao consultar dados. Tente novamente mais tarde.', colors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      <ModalContainer visible={isRecoverPassworrdModalVisible} handleVisible={() => setIsRecoverPassworrdModalVisible(false)}>
        <EsqueceuSenhaForm />
      </ModalContainer>

      <View style={[styles.innerContainer, { backgroundColor: colors.background }]}>
<Image
  source={require('../../assets/images/fidelidade_logo.png')}
  style={styles.logo}
/>        
        <View style={[styles.card, { borderColor: colors.primary }]}>
          <View>
            <Text variant="headlineMedium" style={styles.title}>
              Bem-vindo!
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Entre com seus dados para continuar.
            </Text>

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
                  style={styles.input}
                  error={!!errors.cpf}
                  returnKeyType="next"
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
                  style={styles.input}
                  error={!!errors.password}
                  secureTextEntry={secureTextEntry}
                  right={<TextInput.Icon icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={toggleSecureEntry} />}
                />
              )}
            />

            <Button key={!isConnected ? 'disabled' : 'login'} disabled={!isConnected || loading} mode="contained" onPress={handleSubmit(handleLogin)} loading={loading} style={styles.button}>
              {loading ? 'Aguarde' : 'Continuar'}
            </Button>

            <Button disabled={!isConnected || loading} mode="outlined" onPress={() => navigation.navigate('register-step-one', { tipo: 'NEW_USER' })} style={styles.registerButton}>
              Criar minha conta
            </Button>

            <Button disabled={!isConnected || loading} mode="text" onPress={() => setIsRecoverPassworrdModalVisible(true)} style={{ marginTop: 10, width: '100%' }}>
              Esqueci minha senha
            </Button>
          </View>
        </View>

        {!isConnected && <Text style={styles.errorText}>É necessário uma conexão com a internet para continuar</Text>}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: '100%',
    height:200,
    marginBottom: 0,
    resizeMode: 'contain',
  },
  card: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  registerButton: {
    marginTop: 10,
    width: '100%',
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
