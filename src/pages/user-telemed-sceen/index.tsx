//user telepet screen
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { checkMultiple, PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import { arePermissionsGranted, requestPermissions } from '../../utils/permissions';
import { navigate } from '../../router/navigationRef';
import { useDadosUsuario } from '../../context/pessoa-dados-context';

const UserTelemedScreen = () => {
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const isLogged = !dadosUsuarioData.user.id_usuario_usr ? false : true;

  const permissions = Platform.select({
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
    if (!permissionsGranted) {
      await requestPermissions();
      return;
    }

    if (!isLogged) {
      navigate('user-login-screen-telemed');
      return;
    }

    //navigate('user-telemed-meet-screen')
    navigate('user-telemed-queue-screen');
  };

  useEffect(() => {
    (async () => {
      const grantedInitially = await checkPermissions()
      
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} style={[styles.scrollView, { backgroundColor: colors.background }]}>
        <Text style={styles.title}>Bem-vindo(a)! 🏥</Text>
        <Text style={styles.label}>
          Estamos muito felizes em tê-lo(a) aqui!{`\n`}
          Sua conexão com especialistas em saúde está a apenas um clique de distância.{`\n`}
          Sabemos o quanto seu bem-estar é importante, e nossa missão é garantir que você receba os melhores cuidados, onde quer que esteja.
        </Text>

        <Text style={styles.label}>
          Com nossa plataforma, você pode acessar orientações médicas, tirar dúvidas e cuidar da sua saúde no conforto da sua casa.{`\n`}
          Se precisar de qualquer ajuda durante sua experiência, nossa equipe está pronta para auxiliar!{`\n\n`}
          Vamos juntos garantir mais saúde e qualidade de vida para você e sua família!
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

export default UserTelemedScreen;
