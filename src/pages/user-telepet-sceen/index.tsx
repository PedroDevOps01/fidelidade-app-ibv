import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { checkMultiple, PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import { goBack, navigate } from '../../router/navigationRef';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import ModalContainer from '../../components/modal';

const UserTelepetScreen = () => {
  const { colors } = useTheme();

  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const { dadosUsuarioData } = useDadosUsuario();
  const [pendentModalVisible, setPendentModalVisible] = useState(false);
  const isLogged = !dadosUsuarioData.user.id_usuario_usr ? false : true;
  const hasPendent = dadosUsuarioData.pessoaAssinatura?.inadimplencia

  const permissions =
    Platform.select({
      android: [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO],
      ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE],
    }) || [];

    const checkPermissions = async () => {
      const statuses = await checkMultiple(permissions);
      const allGranted = Object.values(statuses).every(status => status === RESULTS.GRANTED);
      setPermissionsGranted(allGranted);
    };
  
    const requestPermissions = async () => {
      await requestMultiple(permissions);
      await checkPermissions(); // revalida depois do pedido
    };
  
    const handlePress = async () => {

      if (hasPendent) {
        setPendentModalVisible(true);
        return;
      }

      if (!permissionsGranted) {
        await requestPermissions();
        return;
      }
  
      if (!isLogged) {
        navigate('user-login-screen-telepet');
        return;
      }
  
      //navigate('user-telemed-meet-screen')
      navigate('user-telepet-queue-screen');
    };
  
    useEffect(() => {
      (async () => {
        const grantedInitially = await checkPermissions()
        
      })();
    }, []);





  return (
    <View style={styles.container}>
      <ModalContainer visible={pendentModalVisible} handleVisible={() => setPendentModalVisible(false)}>
        <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 20, marginBottom: 20 }}>
          Você possui pendências a serem resolvidas
        </Text>
        <Text style={{ fontFamily: 'Roboto', fontSize: 18, marginBottom: 8 }}>
          Para acessar o atendimento, é necessário regularizar sua situação.
        </Text>
        {/* <Text style={{ fontFamily: 'Roboto', fontSize: 18, marginBottom: 8 }}>
          Acesse a aba "Contratos" e regularize sua situação!
        </Text> */}
        <Button
          onPress={() => {
            setPendentModalVisible(false);
            goBack()
          }}
          mode="contained"
          contentStyle={{ flexDirection: 'row-reverse' }}
          icon={'arrow-right'}
          style={{ marginTop: 20 }}>
          Regularizar
        </Button>
      </ModalContainer>
      <ScrollView contentContainerStyle={styles.contentContainer} style={[styles.scrollView, { backgroundColor: colors.background }]}>
        <Text style={styles.title}>Bem-vindo(a) ao TelePet! 🐾</Text>
        <Text style={styles.label}>
          Estamos muito felizes em tê-lo(a) aqui!
          {`\n`}Sua conexão com especialistas em saúde animal está a apenas um clique de distância.
          {`\n`}Sabemos o quanto seu pet é importante para você, e nossa missão é garantir que ele receba os melhores cuidados de onde quer que você esteja.
        </Text>

        <Text style={styles.label}>
          Com nossa plataforma, você pode acessar orientações veterinárias, tirar dúvidas, e cuidar da saúde do seu amigo peludo no conforto da sua casa.
          {`\n`}Se precisar de qualquer ajuda durante a sua experiência, nossa equipe está pronta para auxiliar!
          {`\n\n`}Vamos juntos garantir uma vida mais saudável e feliz para o seu pet! 🐶🐱
        </Text>
      </ScrollView>

      {/* Botão fixo no fundo da tela */}
      <View style={styles.buttonContainer}>
        <Button
          key={permissionsGranted ? 'enabled' : 'disabled'}
          mode="contained"
          style={styles.button}
          icon={'arrow-right'}
          contentStyle={{ flexDirection: 'row-reverse' }}
          onPress={handlePress}>
          {permissionsGranted ? 'Continuar' : 'Permita a camera e o microfone'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Roboto',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'justify',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  button: {
    justifyContent: 'center',
  },
});

export default UserTelepetScreen;
