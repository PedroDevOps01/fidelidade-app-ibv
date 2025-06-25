import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, BackHandler } from 'react-native';
import { Button, ProgressBar, TextInput, useTheme } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { stepFiveSchema } from '../../form-objects/step-five-form';
import FormErrorLabel from '../../components/form-error-label';
import LoadingAlert from '../../components/loading-alert';
import { useAuth } from '../../context/AuthContext';
import { usePessoaCreate } from '../../context/create-pessoa-context';
import { reset, navigate } from '../../router/navigationRef';
import { useFocusEffect } from '@react-navigation/native';

const RegisterStepFive = ({ route, navigation }: { route: any; navigation: any }) => {
  const theme = useTheme();

  const { dadosUsuarioData, setDadosUsuarioData } = useDadosUsuario();
  const { setAuthData } = useAuth();
  const { clearPessoaCreateData, pessoaCreateData } = usePessoaCreate();

  type StepFiveSchemaFormType = z.infer<typeof stepFiveSchema>;

  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<StepFiveSchemaFormType>({
    resolver: zodResolver(stepFiveSchema),
    defaultValues: {
      hash_senha_usr: '',
    },
  });

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Defina uma senha!', 'Se você sair sem definir uma senha, deverá entrar com o seu numero de CPF como sua senha.', [
        {
          text: 'Continuar',
          onPress: () => null,
        },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const onSubmit = async (data: StepFiveSchemaFormType) => {
    setLoading(true);

    console.log(data);

    try {
      const request = await api.put(`/usuario/${dadosUsuarioData.pessoaDados!.usuario_id}`, data);
      if (request.status === 200) {
        // fazer login

        const loginData = {
          cpf: dadosUsuarioData.pessoa!.cod_cpf_pes,
          hash_senha_usr: getValues().hash_senha_usr,
        };

        const loginRequest = await api.post('/login', loginData);
        const loginResponseData: LoginResponse = loginRequest.data;
        setAuthData(loginResponseData.authorization);
        
        setDadosUsuarioData({
          pessoa: { ...loginResponseData.user, cod_cpf_pes: dadosUsuarioData.pessoa!.cod_cpf_pes },
          pessoaDados: loginResponseData.dados,
          pessoaAssinatura: loginResponseData.assinatura,
          errorCadastroPagarme: loginResponseData.errorCadastroPagarme,
          user: loginResponseData.user
        });

        clearPessoaCreateData();
        reset([{name: 'logged-home-screen'}], 0);
        navigate('user-contracts-stack');
      }
    } catch (err: any) {
      const statusCode = err.response?.status;
      if (statusCode !== 200) {
        Alert.alert('Aviso', 'Ocorreu um erro ao tentar cadastrar sua senha. Tente novamente mais tarde.');
        console.log(err.response);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const onError = (data: any) => {
    console.log('step four errors', JSON.stringify(data, null, 2));
  };


  // se for dependente, nao cadastre senha
  // useFocusEffect(
  //   useCallback(() => {

  //     //volte para a tela dos dependentes
  //     if(pessoaCreateData.tipo == 'DEPENDENT') {

  //       // manda pra tela de pagar 
  //       reset([{name: 'user-dependents-screen'}])
  //     }



  //   }, [])
  // )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingAlert
        isVisible={loading}
        title="Aviso"
        loading={true}
        message="Aguarde enquanto cadastramos..."
        showButtons={false}
        setIsVisible={() => {
          setLoading(prev => !prev);
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ProgressBar progress={1} color={theme.colors.primary} style={{ height: 8, borderRadius: 4, marginBottom: 16 }} />

        <Text style={[styles.title, { color: theme.colors.primary }]}>Agora, cadastre uma senha</Text>

        <Controller
          control={control}
          name="hash_senha_usr"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Senha"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              style={styles.input}
              error={!!errors.hash_senha_usr}
              secureTextEntry={isPasswordVisible}
              right={<TextInput.Icon icon={isPasswordVisible ? 'eye-off' : 'eye'} onPress={() => setIsPasswordVisible(prev => !prev)} />}
            />
          )}
        />

        <FormErrorLabel message={errors.hash_senha_usr?.message!} />

        <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit, onError)}>
          {loading ? 'Aguarde' : 'Continuar'}
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: 'black',
    marginBottom: 20,
  },
  input: {},
  footer: {
    padding: 16,
    justifyContent: 'flex-end',
  },
  button: {
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default RegisterStepFive;
