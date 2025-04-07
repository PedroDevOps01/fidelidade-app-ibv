import { Alert, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { navigate } from '../../router/navigationRef';
import { useDadosUsuario } from '../../context/pessoa-dados-context';

export default function NoMdvFound() {
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();

  const handleButtonPress = () => {
    if (!dadosUsuarioData.pessoaAssinatura) {
      Alert.alert(
        'Aviso', 
        `É necessário ser assinante antes de se tornar um vendedor\nDeseja assinar o plano?`,
      [
        {text: 'Sim', onPress: () => {navigate('new-contract-navigator')}},
        {text: 'Não', onPress: () => {}},
      ])
      return;
    }
    navigate('user-mdv-registration', { newAccount: true });
  };

  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ícone Chamativo */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <MaterialCommunityIcons name="cash-multiple" size={100} color={colors.primary} />
      </View>
      {/* Título Principal */}
      <Text variant="displaySmall" style={{ textAlign: 'center', fontWeight: 'bold', color: colors.primary }}>
        Ganhe Dinheiro Mudando Vidas!
      </Text>
      {/* Card de Chamada */}
      <Card mode="contained" style={{ marginVertical: 20, padding: 20, borderRadius: 12 }}>
        <Text variant="headlineSmall" style={{ textAlign: 'center', fontWeight: 'bold', color: colors.primary }}>
          Torne-se um Vendedor Agora!
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', marginTop: 10 }}>
          Já pensou em ganhar dinheiro ajudando pessoas a cuidarem da saúde?
        </Text>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginTop: 10, color: colors.primary, fontWeight: 'bold' }}>
          Agora você pode!
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', marginTop: 10 }}>
          Seja um vendedor do nosso Programa de Benefícios de Saúde e construa sua própria renda!
        </Text>
      </Card>

      <Button mode="contained" onPress={handleButtonPress}>
        Quero Ser um Vendedor!
      </Button>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});
