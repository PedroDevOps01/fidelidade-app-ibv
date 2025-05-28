import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, RadioButton, Searchbar, TextInput, useTheme, Text, Button, Modal } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { pessoaDadosBancariosSchema, PessoaFormDadosBancariosSchemaType } from '../../form-objects/bank-data-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { api } from '../../network/api';
import { generateRequestHeader, log } from '../../utils/app-utils';
import { useAuth } from '../../context/AuthContext';
import { UserExamsBottomSheetRef } from '../user-exams-bottom-sheet';
import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { SearchBar } from 'react-native-screens';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';
import { useCreateMdv } from '../../context/createMdvContext';
import { goBack, navigate } from '../../router/navigationRef';
import { RouteProp, useRoute } from '@react-navigation/native';
import { toast } from 'sonner-native';
import { Dropdown } from 'react-native-element-dropdown';

type UserMdvRegistrationRouteParams = {
  params: {
    newAccount: boolean;
  };
};

export default function UserMdvRegistration() {
  const route = useRoute<RouteProp<UserMdvRegistrationRouteParams, 'params'>>();
  const { newAccount } = route.params;

  const { dadosUsuarioData } = useDadosUsuario();
  const { colors } = useTheme();
  const { authData } = useAuth();
  const { setMdvBankData } = useCreateMdv();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(false);



  // Bottom sheet control
  const bottomSheetRef = useRef<BottomSheet>(null);

  //cadastrar os dados do tb_pessoa_banco

  const form = useForm<PessoaFormDadosBancariosSchemaType>({
    resolver: zodResolver(pessoaDadosBancariosSchema),
  });

  const { errors } = form.formState;

  async function getAllBanks() {
    setLoadingBanks(true);

    try {
      const response = await api.get(`/banco`, generateRequestHeader(authData.access_token));

      if (response.status == 200) {
        const { data } = response;
        setBanks(data.response.data);
      }
    } catch (err) {
      Alert.alert('Erro', JSON.stringify(err));
    } finally {
      setLoadingBanks(false);
    }
  }

  async function registerBankData(data: PessoaFormDadosBancariosSchemaType) {
    let idPessoa = dadosUsuarioData.pessoaDados?.id_pessoa_pes;

    let data_to_sent = {
      cod_banco_pdb: String(data.codBancoPdb),
      cod_agencia_pdb: String(data.codAgenciaPdb),
      cod_agencia_validador_pdb: String(data.codAgenciaValidadorPdb),
      cod_num_conta_pdb: String(data.codNumContaPdb),
      cod_conta_validador_pdb: String(data.codContaValidadorPdb),
      des_tipo_pdb: String(data.desTipoPdb),
    };
    
    if (newAccount) {
      setMdvBankData(data_to_sent);
      navigate('user-mdv-terms');
    } else {
      //fazer post
      try {
        const response = await api.post(`/pessoa/banco/${idPessoa}`, data_to_sent, generateRequestHeader(authData.access_token));
        if (response.status == 200) {
          toast.success('Dados bancários cadastrados com sucesso!', { position: 'bottom-center' });
          goBack();
        } else {
          Alert.alert('Erro ao cadastrar. Tente novamente mais tarde');
          return;
        }
      } catch (err) {
        console.log('1 err', err);
        toast.error('Erro ao registrar dados bancários.', { position: 'bottom-center' });
      }
    }
  }

  useEffect(() => {
    (async () => {
      await getAllBanks();
    })();
  }, []);

  

  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="titleLarge" style={{ fontWeight: 'bold', marginVertical: 10 }}>
        Insira seus dados bancários
      </Text>

      <Controller
        control={form.control}
        name="codBancoPdb"
        render={({ field: { onChange, value } }) => (
          <>
            <Text>Banco:</Text>
            <Dropdown
              disable={loadingBanks}
              search
              inputSearchStyle={{backgroundColor: colors.background}}
              containerStyle={{ backgroundColor: colors.background }}
              style={[styles.dropdown, { borderRadius: 4, borderWidth: 2, borderColor: errors.codBancoPdb ? colors.error : 'black' }]}
              placeholderStyle={styles.placeholderStyle}
              itemContainerStyle={{ backgroundColor: colors.background }}
              itemTextStyle={{ color: colors.primary }}
              iconStyle={styles.iconStyle}
              data={banks.map(e => ({ label: e.des_descricao_ban, value: e.cod_banco_ban }))}
              labelField="label"
              valueField="value"
              placeholder={loadingBanks ? 'Carregando bancos...' :'Selecione'}
              searchPlaceholder="Pesquise"
              value={value}
              onChange={item => {
                console.log('value', value);
                onChange(item.value);
              }}
            />
          </>
        )}
      />

      <Controller
        control={form.control}
        name="desTipoPdb"
        render={({ field: { onChange, value } }) => (
          <>
            <Text>Tipo:</Text>
            <Dropdown
              style={[styles.dropdown, { borderRadius: 4, borderWidth: 2, borderColor: errors.desTipoPdb ? colors.error : 'black' }]}
              placeholderStyle={styles.placeholderStyle}
              itemContainerStyle={{ backgroundColor: colors.background }}
              itemTextStyle={{ color: colors.primary }}
              iconStyle={styles.iconStyle}
              data={[{label: 'Poupança', value: 'poupanca'}, {label: 'corrente', value: 'Corrente'}].map(e => ({ label: e.label, value: e.value }))}
              labelField="label"
              valueField="value"
              placeholder={'Selecione'}
              searchPlaceholder="Pesquise"
              value={value}
              onChange={item => {
                console.log('value', value);
                onChange(item.value);
              }}
            />
          </>
        )}
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Controller
          control={form.control}
          name="codAgenciaPdb"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{ flex: 7 }}
              label="Agência"
              maxLength={4}
              mode="outlined"
              onChangeText={onChange}
              value={value}
              keyboardType="number-pad"
              error={!!errors.codAgenciaPdb}
            />
          )}
        />

        <Controller
          control={form.control}
          name="codAgenciaValidadorPdb"
          render={({ field: { onChange, value } }) => (
            <TextInput style={{ flex: 3 }} label="Dígito" mode="outlined" onChangeText={onChange} value={value} keyboardType="number-pad" error={!!errors.codAgenciaValidadorPdb} />
          )}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Controller
          control={form.control}
          name="codNumContaPdb"
          render={({ field: { onChange, value } }) => (
            <TextInput style={{ flex: 7 }} label="Conta" mode="outlined" onChangeText={onChange} value={value} keyboardType="number-pad" error={!!errors.codNumContaPdb} />
          )}
        />

        <Controller
          control={form.control}
          name="codContaValidadorPdb"
          render={({ field: { onChange, value } }) => (
            <TextInput style={{ flex: 3 }} label="Dígito" mode="outlined" onChangeText={onChange} value={value} keyboardType="number-pad" error={!!errors.codContaValidadorPdb} />
          )}
        />
      </View>
      <Button key={'register_bank_data'} mode="contained" onPress={form.handleSubmit(registerBankData, err => console.log(err))}>
        Cadastrar dados
      </Button>
    </KeyboardAwareScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  bankCard: (colors: MD3Colors) => ({
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  }),
  bankText: {
    fontSize: 18,
  },
  bottomContainer: (colors: MD3Colors) => ({
    backgroundColor: colors.surfaceVariant,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  }),
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
};
