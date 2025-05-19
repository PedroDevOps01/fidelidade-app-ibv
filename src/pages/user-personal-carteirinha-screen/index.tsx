import { Image, ImageBackground, Platform, StatusBar, StyleSheet } from 'react-native';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { Divider, Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { View } from 'react-native';
import { useLayoutEffect } from 'react';
import { applyCpfMask, applyPhoneMask, formatDateToDDMMYYYY, log } from '../../utils/app-utils';

const UserPersonalCarteirinhaScreen = ({ navigation }: { navigation: any }) => {
  const { dadosUsuarioData } = useDadosUsuario();
  const { colors } = useTheme();

  useLayoutEffect(() => {
    log('data', dadosUsuarioData.pessoaDados);
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0.3,
          borderTopColor: colors.onSurfaceVariant,
          height: Platform.OS == 'android' ? 60 : 90,
          elevation: 0,
        },
      });
    };
  }, [navigation]);

  return (
    <ImageBackground source={require('../../assets/images/carteirinha_bg.png')} style={styles.container} resizeMode="stretch">
      
      <IconButton icon="arrow-left" size={30} iconColor="#fff" style={{ position: 'absolute', top: 20 }} onPress={() => navigation.goBack()} />
      
      <View style={styles.content}>
        <View>
          <Image
            source={require('../../assets/images/app_icon.png')}
            style={{ width: 120, height: 120, alignSelf: 'center', marginBottom: 16, borderRadius: 40 }}
            resizeMode="contain"
          />

          <Text style={styles.name}>{dadosUsuarioData.pessoaDados?.id_pessoa_pda}</Text>
          <Text style={styles.name}>{dadosUsuarioData.pessoaDados?.des_nome_pes}</Text>
          <Text style={styles.type}>{dadosUsuarioData.pessoaDados?.des_descricao_tsi?.toUpperCase()}</Text>
        </View>

        <Divider />

        <View style={styles.infoGroup}>
          <Info label="Plano" value={dadosUsuarioData.pessoaAssinatura ? dadosUsuarioData.pessoaAssinatura?.des_nome_pla : 'Sem plano'} />
          <Info label="CPF" value={applyCpfMask(dadosUsuarioData.pessoaDados?.cod_cpf_pes!)} />
          <Info label="Nascimento" value={formatDateToDDMMYYYY(dadosUsuarioData.pessoaDados?.dta_nascimento_pes!)} />
          <Info label="Telefone" value={applyPhoneMask(dadosUsuarioData.pessoaDados?.num_celular_pes!)} />
          <Info label="Email" value={dadosUsuarioData.pessoaDados?.des_email_pda} />
          <Info
            label="Endereço"
            value={`${dadosUsuarioData.pessoaDados?.des_endereco_pda} ${dadosUsuarioData.pessoaDados?.num_endereco_pda}, ${dadosUsuarioData.pessoaDados?.des_bairro_pda}`}
          />
          <Info label="Cidade/UF" value={`${dadosUsuarioData.pessoaDados?.des_municipio_mun} - ${dadosUsuarioData.pessoaDados?.des_estado_est}`} />
        </View>
      </View>
    </ImageBackground>
  );
};

const Info = ({ label, value }: { label: string; value?: string }) => (
  <Text style={styles.infoText}>
    <Text style={styles.infoLabel}>{label}: </Text>
    {value}
  </Text>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
  },
  content: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingVertical: 32,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 0,
  },
  infoGroup: {
    gap: 12,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default UserPersonalCarteirinhaScreen;
