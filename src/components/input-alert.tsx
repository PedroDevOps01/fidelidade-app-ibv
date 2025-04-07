import React, {useEffect, useState} from 'react';
import {
  Dialog,
  Portal,
  Text,
  useTheme,
  Button,
  TextInput,
} from 'react-native-paper';
import {validatePassword} from '../utils/app-utils';
import FormErrorLabel from './form-error-label';
import { useAuth } from '../context/AuthContext';
import { useDadosUsuario } from '../context/pessoa-dados-context';
import { api } from '../network/api';
import { Alert } from 'react-native';

interface InputAlertProps {
  title: string;
  isVisible: boolean;
  setIsVisible?: () => void;
  dismissable?: boolean;
}

const InputAlert = ({
  title,
  isVisible,
  setIsVisible,
  dismissable = true,
}: InputAlertProps) => {
  const theme = useTheme();

  const {authData} = useAuth()
  const { dadosUsuarioData } = useDadosUsuario()

  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [isPasswordOK, setIsPasswordOK] = useState<boolean>(false);
  const [passwordHintText, setPasswordHintText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isConfirmPasswordOK, setIsConfirmPasswordOK] = useState<boolean>(false);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const onInputAlertConfirmButtonPress = async () => {
    setIsLoading(true);
    try {
      const request = await api.put(
        `/usuario/${dadosUsuarioData.pessoaDados!.usuario_id}`,
        {
          hash_senha_usr: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `bearer ${authData.access_token}`,
          },
        },
      );
      if (request.status === 200) {
        const {data} = request;

        Alert.alert('Aviso', 'Senha alterada com sucesso', [
          {text: 'Continuar', onPress: () => setIsVisible!()}
        ]);
      }
    } catch (err: any) {
      Alert.alert('Aviso', 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
      setPassword('');
      setConfirmPassword('')
    }
  };

  useEffect(() => {
    const test = validatePassword(password);
    setIsPasswordOK(test.valid);

    if (!test.valid) {
      setPasswordHintText(test.message!);
    } else {
      setPasswordHintText(null);
    }

    // Comparar a senha principal com a confirmação
    if (password && confirmPassword) {
      setIsConfirmPasswordOK(password === confirmPassword);
    } else {
      setIsConfirmPasswordOK(false);
    }
  }, [password, confirmPassword]);

  return (
    <Portal>
      <Dialog
        visible={isVisible}
        style={{
          backgroundColor: theme.colors.background,
          padding: 16,
        }}
        dismissable={dismissable}
        onDismiss={setIsVisible}>
        <Dialog.Title style={{fontSize: 20, fontWeight: 'bold'}}>
          {title}
        </Dialog.Title>
        <Text style={{marginBottom: 10}}>
          Use os campos abaixo para alterar sua senha
        </Text>

        {/* Campo de Senha */}
        <TextInput
          mode="outlined"
          label="Nova Senha"
          value={password}
          onChangeText={e => setPassword(e)}
          error={!isPasswordOK}
          secureTextEntry={secureTextEntry}
          right={
            <TextInput.Icon
              icon={secureTextEntry ? 'eye-off' : 'eye'}
              onPress={toggleSecureEntry}
            />
          }
        />
        <FormErrorLabel message={passwordHintText!} />

        {/* Campo de Confirmação de Senha */}
        <TextInput
          mode="outlined"
          label="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={!isConfirmPasswordOK}
          secureTextEntry={secureTextEntry}
          right={
            <TextInput.Icon
              icon={secureTextEntry ? 'eye-off' : 'eye'}
              onPress={toggleSecureEntry}
            />
          }
          style={{marginTop: 10}}
        />
        {!isConfirmPasswordOK && confirmPassword.length > 0 && (
          <FormErrorLabel message="As senhas não coincidem." />
        )}

        <Dialog.Actions style={{marginTop: 10}}>
          <Button
            key={(!isPasswordOK || !isConfirmPasswordOK || isLoading) ? 'disabled' : 'enabled'}
            mode="contained"
            onPress={() => {
              if (isPasswordOK && isConfirmPasswordOK) {
                onInputAlertConfirmButtonPress();
              }
            }}
            contentStyle={{height: 50}}
            style={{width: '100%'}}
            disabled={!isPasswordOK || !isConfirmPasswordOK || isLoading}>
            Continuar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default InputAlert;
