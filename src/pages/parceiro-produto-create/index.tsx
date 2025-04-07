import {Controller, useForm} from 'react-hook-form';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {
  productParceiroSchema,
  ProductParceiroSchemaFormType,
} from '../../form-objects/product-form-object';
import {zodResolver} from '@hookform/resolvers/zod';
import {useEffect, useState} from 'react';
import {maskBrazilianCurrency} from '../../utils/masks';
import {DatePickerInput} from 'react-native-paper-dates';
import dayjs from 'dayjs';
import ImageGalleryGrid from './image-gallery-grid';
import {Asset} from 'react-native-image-picker';
import {api} from '../../network/api';
import {useAuth} from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AxiosResponse} from 'axios';
import CategoryModal from '../user-produtos-screen/category-modal';
import {PaperSelect} from 'react-native-paper-select';

interface ParceiroProdutoCreateScreenProps {
  route: any;
  navigation: any;
}

const defaultValues: PaperSelectContent = {
  value: '',
  list: [],
  selectedList: [],
  error: '',
};

const ParceiroProdutoCreateScreen = ({
  route,
  navigation,
}: ParceiroProdutoCreateScreenProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const {authData} = useAuth();
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [categories, setCategories] =
    useState<PaperSelectContent>(defaultValues);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: {errors},
  } = useForm<ProductParceiroSchemaFormType>({
    resolver: zodResolver(productParceiroSchema),
    defaultValues: {
      url_img_produto_ppc: [],
      is_ativo_ppc: undefined,
      id_categoria_ppc: undefined,
    },
  });

  const ims = watch('url_img_produto_ppc');
  const active = watch('is_ativo_ppc');

  useEffect(() => {
    (async () => {
      const d = await AsyncStorage.getItem('user_data');
      const {pessoaDados: parsedD} = JSON.parse(d!);
      if (parsedD.id_parceiro_pes && parsedD.usuario_id) {
        setValue('id_parceiro_ppc', parsedD.id_parceiro_pes!);
        setValue('id_usr_cadastro_ppc', parsedD.usuario_id!);
      }

      if (route.params?.id_produto_parceiro_ppc) {
        fetchProdutoData(route.params.id_produto_parceiro_ppc);
      }
      await requestCategories();
      setLoadingScreen(false);
    })();
  }, []);

  useEffect(() => {
    if (categories.selectedList.length > 0) {
      const id = categories.selectedList.map((e: any) => Number(e._id))[0];
      setValue('id_categoria_ppc', id);
    }
  }, [categories.selectedList]);




  const id_categoria = watch('id_categoria_ppc')

  useEffect(() => {

    if(categories.list.length > 0) {
      

      const selectedList = categories.list.filter(e => e._id === String(id_categoria))
      const value = categories.list.filter(e => e._id === String(id_categoria))[0].value
      console.log('selectedList', selectedList)
      console.log('value', value)


      setCategories({
        ...categories,
        selectedList,
        value
      });

    }
  

  }, [id_categoria])
  

  async function requestCategories() {
    try {
      const response = await api.get('/categorias-produto', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${authData.access_token}`,
        },
      });

      if (response.status == 200) {
        const {data} = response;
        setCategories(prev => ({
          ...prev,
          list: data.response.data.map((item: any) => ({
            label: String(item.nome_categoria_cpp),
            value: String(item.nome_categoria_cpp),
            _id: String(item.id_categoria_cpp),
          })),
          error: '',
        }));
      }
    } catch (err: any) {
      Alert.alert('Aviso', 'Erro ao carregar categorias', [
        {
          text: 'ok',
          onPress: () => navigation.goBack(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProdutoData(id_produto_parceiro_ppc: number) {
    try {
      const request = await api.get(
        `/produto-parceiro?id_produto_parceiro_ppc=${id_produto_parceiro_ppc}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `bearer ${authData.access_token}`,
          },
        },
      );

      const {data: resp} = request;
      const {response} = resp;
      const {data} = response;

      setValue('id_produto_parceiro_ppc', data[0].id_produto_parceiro_ppc);
      setValue('des_nome_produto_ppc', data[0].des_nome_produto_ppc);
      setValue('desc_produto_ppc', data[0].desc_produto_ppc);
      setValue(
        'vlr_produto_ppc',
        maskBrazilianCurrency(data[0].vlr_produto_ppc),
      );
      setValue(
        'dta_vencimento_produto_ppc',
        data[0].dta_vencimento_produto_ppc,
      );
      setValue('url_img_produto_ppc', [
        {
          uri: String(data[0].url_img_produto_ppc),
          name: 'a',
          size: 0,
          type: `image/${String(data[0].url_img_produto_ppc).split('.').pop()}`,
        },
      ]);
      setValue('is_ativo_ppc', data[0].is_ativo_ppc);
      setValue('id_categoria_ppc', data[0].id_categoria_ppc);

    } catch (err) {
      console.log('err', err);
    }
  }

  

  const setImages = (assets: Asset[]) => {
    if (assets) {
      const currentImages = getValues('url_img_produto_ppc');
      const uris = assets.map(e => ({
        uri: e.uri!,
        size: e.fileSize!,
        type: e.type!,
        name: e.fileName!,
      }));
      setValue('url_img_produto_ppc', [...currentImages!, ...uris]);
    }
  };

  const deleteImages = (uri: string) => {
    const currentImages = getValues('url_img_produto_ppc');
    const updatedImages = currentImages?.filter(e => e.uri !== uri);
    setValue('url_img_produto_ppc', updatedImages);
  };

  const onSubmit = async (data: ProductParceiroSchemaFormType) => {
    setLoading(true);

    const formData = new FormData();

    formData.append('des_nome_produto_ppc', data.des_nome_produto_ppc);
    formData.append('desc_produto_ppc', data.desc_produto_ppc);
    formData.append(
      'dta_vencimento_produto_ppc',
      data.dta_vencimento_produto_ppc,
    );
    formData.append('id_parceiro_ppc', data.id_parceiro_ppc);
    formData.append('id_usr_cadastro_ppc', data.id_usr_cadastro_ppc);
    formData.append(
      'vlr_produto_ppc',
      Number(data.vlr_produto_ppc.replace(/[^\d]/g, '')),
    );
    formData.append('url_img_produto_ppc', {
      uri: getValues('url_img_produto_ppc')![0].uri,
      type: getValues('url_img_produto_ppc')![0].type,
      name: getValues('url_img_produto_ppc')![0].name,
    });
    
    formData.append('id_categoria_ppc', data.id_categoria_ppc)

    try {
      let request: AxiosResponse<any, any>;

      if (route.params) {
        formData.append('_method', 'PUT');
      }

      
      request = await api.post(
        `/produto-parceiro${
          route.params ? `/${route.params.id_produto_parceiro_ppc}` : ''
        }`,
        formData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Authorization: `bearer ${authData.access_token}`,
          },
        },
      );

      if (request.status === 200) {
        const message = request.data.message;
        Alert.alert('Aviso', message, [
          {
            text: 'Confirmar',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (err: any) {
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Erro desconhecido';
        console.log('errorMessage', err.response.data);
        Alert.alert('Aviso', `Erro ao cadastrar produto: ${errorMessage}`);
      } else {
        Alert.alert(
          'Aviso',
          'Erro ao cadastrar produto. Verifique os dados inseridos e tente novamente',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmitStatus = async (status: string) => {
    console.log(
      'sta',
      `/produto-parceiro/${route.params.id_produto_parceiro_ppc}`,
    );
    setLoading(true);

    const config = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `bearer ${authData.access_token}`,
      },
    };

    try {
      let request: AxiosResponse<any, any>;

      if (status === 'inactive') {
        request = await api.patch(
          `/produto-parceiro/${route.params.id_produto_parceiro_ppc}`,
          {},
          config,
        );
      } else {
        request = await api.delete(
          `/produto-parceiro/${route.params.id_produto_parceiro_ppc}`,
          config,
        );
      }

      if (request.status == 200) {
        Alert.alert('Aviso', request.data.data.message, [
          {
            text: 'Voltar',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Aviso', request.data.error.message, [
          {
            text: 'Voltar',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (err: any) {
      Alert.alert(
        'Aviso',
        'Erro ao realizar a operação. Tente novamente mais tarde.',
        [
          {
            text: 'Voltar',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  const onError = async (data: Record<string, any>) => {
    console.log('error teste: ', JSON.stringify(data, null, 2));
  };



  return (
    <>
      {loadingScreen && categories.list.length == 0? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
          }}>
          <ActivityIndicator size={40} />
        </View>
      ) : (
        <ScrollView
          style={[
            styles.container,
            {backgroundColor: theme.colors.background},
          ]}>
            
          <Controller
            control={control}
            name="des_nome_produto_ppc"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                label="Nome"
                mode="outlined"
                error={!!errors.des_nome_produto_ppc}
                onBlur={onBlur}
                onChangeText={e => {
                  onChange(e);
                }}
                value={value}
                style={styles.input}
                disabled={active == 0}
              />
            )}
          />

          <Controller
            control={control}
            name="desc_produto_ppc"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                label="Descrição"
                mode="outlined"
                lineBreakStrategyIOS="standard"
                numberOfLines={4}
                multiline={true}
                error={!!errors.desc_produto_ppc}
                onBlur={onBlur}
                onChangeText={e => {
                  onChange(e);
                }}
                value={value}
                style={styles.input}
                disabled={active == 0}
                maxLength={255}
              />
            )}
          />

          <Controller
            control={control}
            name="vlr_produto_ppc"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                label="Valor"
                placeholder="R$: "
                mode="outlined"
                keyboardType="numeric"
                error={!!errors.vlr_produto_ppc}
                onBlur={onBlur}
                onChangeText={e => {
                  onChange(maskBrazilianCurrency(e));
                }}
                value={String(value ?? '')}
                style={styles.input}
                disabled={active == 0}
              />
            )}
          />

          <Controller
            control={control}
            name="dta_vencimento_produto_ppc"
            render={({field: {onChange, value}}) => (
              <DatePickerInput
                error={true}
                locale="pt-BR"
                label="Data de Vencimento"
                withDateFormatInLabel={false}
                value={value ? dayjs(value).toDate() : undefined}
                onChange={date => {
                  const formattedDate = date
                    ? dayjs(date).format('YYYY-MM-DD')
                    : '';
                  onChange(formattedDate);
                }}
                inputMode="start"
                style={{
                  maxHeight: 60,
                  alignSelf: 'flex-start',
                  marginBottom: '4%',
                }}
                mode="outlined"
                disabled={active == 0}
              />
            )}
          />

          <Controller
            control={control}
            name="id_categoria_ppc"
            render={({field: {onChange, value}}) => (
              <PaperSelect
                label="Selecione a categoria"
                value={ categories.value ?? String(categories.value) }
                onSelection={(value: any) => {
                  setCategories({
                    ...categories,
                    selectedList: value.selectedList,
                    value: value.text, // Exibe o rótulo selecionado
                  });
                  onChange(value.selectedList[0]._id)
                }}
                arrayList={[...categories.list]}
                selectedArrayList={categories.selectedList}
                multiEnable={false}
                errorText={categories.error}
                hideSearchBox
                dialogCloseButtonText="Cancelar"
                dialogDoneButtonText="Continuar"
                selectAllText="Selecionar todos"
                textInputMode="outlined"
              />
            )}
          />

          <ImageGalleryGrid
            setImages={setImages}
            deleteImage={deleteImages}
            isProdutoActive={active == 0}
            images={getValues('url_img_produto_ppc')!}
          />

          {getValues('url_img_produto_ppc')!.length >= 1 ? (
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit, onError)}
              style={{marginBottom: 12}}
              disabled={loading || active == 0}>
              {route.params ? 'Atualizar' : 'Criar produto'}
            </Button>
          ) : (
            <></>
          )}

          {getValues('is_ativo_ppc') ? (
            <Button
              mode="text"
              onPress={() =>
                onSubmitStatus(active == 1 ? 'active' : 'inactive')
              }
              style={{marginBottom: 12}}
              disabled={loading}>
              {getValues('is_ativo_ppc') == 1
                ? 'Inativar produto'
                : 'Ativar produto'}
            </Button>
          ) : (
            <></>
          )}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  form: {
    flex: 1,
  },
  section: {},
  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  footer: {
    justifyContent: 'flex-end',
    paddingVertical: 16,
  },
  button: {
    height: 48,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default ParceiroProdutoCreateScreen;
