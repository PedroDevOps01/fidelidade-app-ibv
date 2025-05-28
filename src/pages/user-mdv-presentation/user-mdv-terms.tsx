import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTheme, Text, Button, Checkbox } from 'react-native-paper';
import { useState } from 'react';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { generateRequestHeader, log } from '../../utils/app-utils';
import { useAuth } from '../../context/AuthContext';
import { navigate, reset } from '../../router/navigationRef';
import LoadingFull from '../../components/loading-full';
import { toast } from 'sonner-native';
import { useCreateMdv } from '../../context/createMdvContext';
import { CommonActions, useNavigation } from '@react-navigation/native';

export default function UserMdvTerms() {
  const { colors } = useTheme();
  const { dadosUsuarioData, setDadosUsuarioData } = useDadosUsuario();
  const { mdvBankData } = useCreateMdv();
  const { authData } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [creating, setCreating] = useState(false);

  const [message, setMessage] = useState<string>('');

  const navigate = useNavigation();
  // 1 - Criando dados bancários
  const creatingBankData = async () => {
    setMessage('Aguarde...');
    //setCreating(true);
    let idPessoa = dadosUsuarioData.pessoaDados?.id_pessoa_pes;
    try {

      let data_to_sent = {
        ...mdvBankData,
        cod_agencia_validador_pdb: mdvBankData?.cod_agencia_validador_pdb.length == 0 ? "0" : mdvBankData?.cod_agencia_validador_pdb
      }

      const response = await api.post(`/pessoa/banco/${idPessoa}`, data_to_sent, generateRequestHeader(authData.access_token));

      if (response.status == 200) {
        const { data } = response;
        let id_pessoa_banco_pdb = data.pessoaBanco.id_pessoa_banco_pdb;
        creatingMdv(id_pessoa_banco_pdb);
      }
      else {
        Alert.alert('Erro ao cadastrar. Tente novamente mais tarde');
        return;
      }
    } catch (err) {
      console.log('1 err', err);
      toast.error('Erro ao registrar dados bancários.', { position: 'bottom-center' });
      setCreating(false);
    }
  };

  // 2 - registrar mdv
  const creatingMdv = async (id_pessoa_banco_pdb: string) => {
    let idUsuario = dadosUsuarioData.pessoa?.id_usuario_usr;
    setMessage('Registrando dados...');
    try {
      let data_to_sent = {
        id_tipo_cargo_umv: 3,
        id_usuario_umv: idUsuario,
        id_pessoa_banco_pdb,
      };

      const response = await api.post(`/usuario-mdv`, data_to_sent, generateRequestHeader(authData.access_token));

      if (response.status == 200) {
        const { data } = response;
        setDadosUsuarioData({
          ...dadosUsuarioData,
          pessoaMdv: [data.data],
        });
        setCreating(false);

        navigate.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'user-mdv-home' }],
          }),
        );
      } else {
        Alert.alert('Erro ao cadastrar. Tente novamente mais tarde');
        setCreating(false);
        return;
      }
    } catch (err: any) {
      console.log('2 err', JSON.stringify(err.response.data, null, 2));
      toast.error(`Erro ao registrar dados de MDV. Tente novamente mais tarde`, { position: 'bottom-center' });
      setCreating(false);
    }
  };

  const onAccept = () => {
    creatingBankData();
  };

  return (
    <View style={styles.container(colors)}>
      {creating ? (
        <LoadingFull title={message} />
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 10 }}>
            Termos de Uso para Vendedores
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 10, color: colors.onBackground }}>
            Última atualização: 01/03/2025
          </Text>

          <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
            Bem-vindo(a)! Este Termo de Uso estabelece as regras e condições para que você ("Vendedor") utilize a plataforma para vender o programa de beneficios. Ao se cadastrar
            como vendedor, você concorda com os termos abaixo.
          </Text>

          {/* Seções do Termo */}
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 10 }}>
            1. Cadastro e Elegibilidade
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
            1.1. Para se tornar um Vendedor, é necessário:
          </Text>
          <Text variant="bodyMedium">• Ter 18 anos ou mais ou ser uma empresa registrada.</Text>
          <Text variant="bodyMedium">• Fornecer informações verdadeiras e atualizadas, endereço e dados bancários.</Text>
          <Text variant="bodyMedium">• Possuir uma conta válida na Plataforma.</Text>

          <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
            1.2. A aprovação do cadastro está sujeita à análise da Plataforma, que pode recusar ou suspender cadastros sem necessidade de justificativa.
          </Text>

          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 10 }}>
            2. Responsabilidades do Vendedor
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
            2.1. O Vendedor se compromete a:
          </Text>
          <Text variant="bodyMedium">• Oferecer o programa de benefícios, sem violação de direitos autorais ou leis.</Text>
          <Text variant="bodyMedium">• Informar sobre valores e vantagens regularmente.</Text>

          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 10 }}>
            3. Comissões e Pagamentos
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
            3.1. A Plataforma pode cobrar taxas sobre as vendas realizadas. Os valores e percentuais serão informados no painel do Vendedor.
          </Text>
          <Text variant="bodyMedium">3.2. Os pagamentos ao Vendedor serão realizados conforme a política de repasse da Plataforma.</Text>

          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 10 }}>
            4. Rescisão e Penalidades
          </Text>
          <Text variant="bodyMedium">4.1. O Vendedor pode encerrar sua conta a qualquer momento, desde que não haja vendas pendentes.</Text>
          <Text variant="bodyMedium">4.2. A Plataforma pode suspender ou encerrar a conta do Vendedor em caso de violação destes Termos de Uso.</Text>

          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 10 }}>
            5. Alterações nos Termos
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
            5.1. A Plataforma pode modificar este Termo a qualquer momento. O uso contínuo da Plataforma após qualquer alteração constitui aceitação automática dos novos Termos.
          </Text>

          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 10 }}>
            6. Disposições Gerais
          </Text>
          {/* <Text variant="bodyMedium">6.1. Este Termo é regido pelas leis do [País] e qualquer disputa será resolvida no foro da cidade de [Cidade].</Text> */}
          <Text variant="bodyMedium">6.1. Para dúvidas ou suporte, entre em contato pelo e-mail: fidelidade@mail.com.</Text>

          {/* Checkbox de Aceitação */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
            <View style={{ borderWidth: 1, borderColor: colors.primary, borderRadius: 5, marginRight: 10 }}>
              <Checkbox status={accepted ? 'checked' : 'unchecked'} onPress={() => setAccepted(!accepted)} color={colors.primary} />
            </View>
            <TouchableOpacity onPress={() => setAccepted(!accepted)}>
              <Text variant="bodyMedium">Aceito os Termos de Uso e desejo me tornar um Vendedor.</Text>
            </TouchableOpacity>
          </View>

          {/* Botão de Aceitação */}
          <Button mode="contained" key={accepted ? 'enabled' : 'disabled'} onPress={onAccept} disabled={!accepted} style={{ marginTop: 10 }}>
            Aceitar e Continuar
          </Button>
        </ScrollView>
      )}
    </View>
  );
}

const styles = {
  container: (colors: MD3Colors) => ({
    backgroundColor: colors.background,
    flex: 1,
    padding: 16,
  }),
};
