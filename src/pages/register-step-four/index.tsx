import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, ProgressBar, TextInput, useTheme, Checkbox } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stepFourSchema } from '../../form-objects/step-four-form';
import { usePessoaCreate } from '../../context/create-pessoa-context';
import { z } from 'zod';
import { applyPhoneMask, generateRequestHeader, log } from '../../utils/app-utils';
import { api } from '../../network/api';
import { CreatePessoaResponse } from '../../types/create-pessoa-response';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { toast } from 'sonner-native';
import { useAuth } from '../../context/AuthContext';

const RegisterStepFour = ({ navigation }) => {
  const theme = useTheme();
  const { pessoaCreateData, setPessoaCreateData } = usePessoaCreate();
  const { setDadosUsuarioData, userContracts, dadosUsuarioData } = useDadosUsuario();
  const { authData } = useAuth();

  type StepFourSchemaFormType = z.infer<typeof stepFourSchema>;

  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<StepFourSchemaFormType>({
    resolver: zodResolver(stepFourSchema),
    defaultValues: {
      num_celular_pes: '',
      num_telefone_pes: '',
      num_whatsapp_pes: '',
      acceptTerms: false,
    },
    mode: 'onChange',
  });

  // Updated function to navigate to PdfViewerScreen without fileName
  const openTerms = () => {
    navigation.navigate('PdfViewerScreen');
  };

  const onSubmit = async (data: StepFourSchemaFormType) => {
    log('data', data);
    setLoading(true);

    const localData = {
      ...pessoaCreateData,
      num_whatsapp_pes: Number(data.num_whatsapp_pes),
      num_celular_pes: Number(data.num_celular_pes),
      num_telefone_pes: data.num_telefone_pes !== '' ? data.num_telefone_pes : undefined,
    };

    setPessoaCreateData(localData);
    setIsReady(true);
  };

  const onError = (data: any) => {
    if (data.acceptTerms) {
      Alert.alert('Aviso', data.acceptTerms.message);
    }
  };

  useEffect(() => {
    if (!isReady) return;

    const sendRequest = async () => {
      try {
        if (pessoaCreateData.num_whatsapp_pes) {
          const request = await api.post('/pessoa', pessoaCreateData);

          if (request.status === 200) {
            const data: CreatePessoaResponse = request.data;
            setDadosUsuarioData(data);
            navigation.navigate('register-step-five');
          }
        }
      } catch (err: any) {
        let errorMessage = 'Ocorreu um erro ao tentar cadastrar.';
        if (String(err.response?.data.message).includes('cpf')) {
          errorMessage = 'O CPF já se encontra registrado no sistema.';
        }
        Alert.alert('Aviso', errorMessage);
      } finally {
        setIsReady(false);
        setLoading(false);
      }
    };

    const registerDependent = async () => {
      try {
        const contratoId = userContracts.filter(e => e.is_ativo_ctt == 1)[0].id_contrato_ctt;
        const request = await api.post('/pessoa', pessoaCreateData, generateRequestHeader(authData.access_token));

        if (request.status !== 200) {
          throw new Error('Erro ao criar pessoa');
        }

        const data: CreatePessoaResponse = request.data;

        const res = await api.post(
          `/contrato/${contratoId}/dependente`,
          {
            id_titular_rtd: dadosUsuarioData.pessoaDados?.id_pessoa_pes,
            id_dependente_rtd: data.pessoa.id_pessoa_pes,
          },
          generateRequestHeader(authData.access_token),
        );

        if (res.status === 200) {
          toast.success('Dependente adicionado com sucesso!', {
            position: 'bottom-center',
            styles: {
              toast: { backgroundColor: theme.colors.inverseSurface },
              title: { color: theme.colors.inverseOnSurface },
            },
          });
        } else {
          toast.error('Erro ao adicionar Dependente!', {
            position: 'bottom-center',
            styles: {
              toast: { backgroundColor: theme.colors.inverseSurface },
              title: { color: theme.colors.inverseOnSurface },
            },
          });
        }
        navigation.navigate('user-dependents-screen');
      } catch (err: any) {
        toast.error(`Erro ao registrar dependente: ${err.message}`, {
          position: 'bottom-center',
          styles: {
            toast: { backgroundColor: theme.colors.inverseSurface },
            title: { color: theme.colors.inverseOnSurface },
          },
        });
        navigation.navigate('user-dependents-screen');
      } finally {
        setLoading(false);
      }
    };

    if (pessoaCreateData.tipo === 'NEW_USER') {
      sendRequest();
    } else {
      registerDependent();
    }
  }, [isReady]);

  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProgressBar progress={0.8} color={theme.colors.primary} style={{ height: 8, borderRadius: 4, marginBottom: 16 }} />

      <Text style={[styles.title, { color: theme.colors.primary }]}>Informe seus telefones de contato</Text>

      <Controller
        control={control}
        name="num_whatsapp_pes"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="WhatsApp"
            keyboardType="number-pad"
            value={value}
            onChangeText={e => {
              onChange(applyPhoneMask(e));
              setValue('num_celular_pes', applyPhoneMask(e));
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.num_whatsapp_pes}
          />
        )}
      />

      <Controller
        control={control}
        name="num_celular_pes"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Número do telefone celular"
            keyboardType="number-pad"
            value={value}
            onChangeText={e => {
              onChange(applyPhoneMask(e));
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.num_celular_pes}
          />
        )}
      />

      <Controller
        control={control}
        name="num_telefone_pes"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Número de telefone"
            keyboardType="number-pad"
            value={value}
            onChangeText={e => {
              onChange(applyPhoneMask(e, 10));
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.num_telefone_pes}
          />
        )}
      />

      <Controller
        control={control}
        name="acceptTerms"
        render={({ field: { onChange, value } }) => (
          <View style={styles.checkboxContainer}>
            <Checkbox status={value ? 'checked' : 'unchecked'} onPress={() => onChange(!value)} color={theme.colors.primary} />
            <Text style={styles.checkboxLabel}>
              Li e aceito os{' '}
              <Text style={styles.linkText} onPress={openTerms}>
                termos de adesão
              </Text>
            </Text>
          </View>
        )}
      />
      {errors.acceptTerms && <Text style={styles.errorText}>{errors.acceptTerms.message}</Text>}

      <View>
        <Button mode="contained" loading={loading} disabled={loading || !isValid} onPress={handleSubmit(onSubmit, onError)}>
          {loading ? 'Aguarde' : 'Continuar'}
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, paddingHorizontal: 16 },
  title: { fontFamily: 'Roboto-Bold', fontSize: 24, color: 'black', marginBottom: 20 },
  input: { marginBottom: 20 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkboxLabel: { fontSize: 16, color: 'black' },
  linkText: { color: '#0000FF', textDecorationLine: 'underline' },
  errorText: { color: 'red', fontSize: 14, marginBottom: 20 },
});

export default RegisterStepFour;