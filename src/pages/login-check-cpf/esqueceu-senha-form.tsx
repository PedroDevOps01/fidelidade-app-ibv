import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Controller, useForm } from 'react-hook-form';
import { EsqueceuSenhaFormSchemaType, esqueceuSenhaSchema } from '../../form-objects/esqueceu-sehna-form-object';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyCpfMask, generateRequestHeader } from '../../utils/app-utils';
import { DatePickerInput } from 'react-native-paper-dates';
import dayjs from 'dayjs';
import CustomToast from '../../components/custom-toast';
import { api } from '../../network/api';

interface EsqueceuSenhaFormProps {}

const EsqueceuSenhaForm = () => {
  const [loading, setLoading] = useState(false);
  const { authData } = useAuth();
  const { colors } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EsqueceuSenhaFormSchemaType>({
    resolver: zodResolver(esqueceuSenhaSchema),
  });

  const onSubmit = async (data: EsqueceuSenhaFormSchemaType) => {
    setLoading(true);
    try {
      const response = await api.post('/usuario/recoverPassword', data, generateRequestHeader(authData.access_token));

      console.log(response.status);

      if (response.status == 200) {
        const { data } = response;
        CustomToast(data.data.message, colors, 'success');
      }
    } catch (err: any) {
      const { data } = err.response;

      CustomToast(data.error.message, colors, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onError = (error: any) => {
    console.log('error', error);
  };

  useEffect(() => {
    // CustomToast("Teste", colors, "error")
  }, []);

  return (
    <View style={[{ backgroundColor: colors.background }]}>
      <View>
        <Controller
          control={control}
          name="cod_cpf_pes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="CPF"
              mode="outlined"
              onChangeText={e => onChange(applyCpfMask(e))}
              value={value}
              keyboardType="number-pad"
              error={!!errors.cod_cpf_pes}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="dta_nascimento_pes"
          render={({ field: { onChange, value } }) => (
            <DatePickerInput
              locale="pt-BR"
              label="Data de Nascimento"
              withDateFormatInLabel={false}
              value={value ? dayjs(value).toDate() : undefined}
              onChange={date => {
                const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';
                console.log('formattedDate', formattedDate);
                onChange(formattedDate);
              }}
              inputMode="start"
              style={{
                maxHeight: 60,
                alignSelf: 'flex-start',
              }}
              mode="outlined"
              hasError={!!errors.dta_nascimento_pes}
            />
          )}
        />
        <Button mode="contained" disabled={loading} style={{ marginTop: 80 }} onPress={handleSubmit(onSubmit, onError)}>
          {loading ? "Aguarde..." : "Continuar"} 
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },

  input: {
    marginBottom: 20,
  },
  footer: {
    justifyContent: 'flex-end',
    paddingVertical: 16,
    bottom: 10,
  },
  button: {
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default EsqueceuSenhaForm;
