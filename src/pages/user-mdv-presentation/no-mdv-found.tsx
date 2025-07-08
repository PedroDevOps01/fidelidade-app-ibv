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
        `É necessário ser assinante antes de se tornar um vendedor\nDeseja assinar um plano?`,
      [
        {text: 'Sim', onPress: () => {navigate('new-contract-navigator')}},
        {text: 'Não', onPress: () => {}},
      ])
      return;
    }
    navigate('user-mdv-registration', { newAccount: true });
  };

  // Dados para cards de benefícios
  const benefits = [
    {
      icon: 'cash-sync',
      title: 'Renda Extra',
      description: 'Ganhe comissões atrativas em cada venda realizada'
    },
    {
      icon: 'chart-line',
      title: 'Crescimento',
      description: 'Construa sua própria rede e aumente seus ganhos'
    },
    {
      icon: 'account-group',
      title: 'Comunidade',
      description: 'Faça parte de uma equipe de suporte e treinamento'
    }
  ];

  return (
    <KeyboardAwareScrollView 
      keyboardShouldPersistTaps="handled" 
      contentContainerStyle={[styles.container, { backgroundColor: '#e7d7ff' }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Ícone Principal com Destaque */}
        

        {/* Título Principal */}
         <Card 
          mode="contained" 
          elevation={3}
          style={styles.benefitsContainerultimo}
        >
          <Card.Content>

          

        {/* Subtítulo */}
       
            <Text variant="titleLarge" style={[styles.mainTitle, { color: colors.primary }]}>
              Torne-se um Vendedor Oficial!
            </Text>
            <View style={styles.bulletList}>
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} style={styles.bulletIcon} />
              <Text style={[styles.bulletText, { color: colors.onSurface }]}>
                Sem custos para iniciar
              </Text>
            </View>
            <View style={styles.bulletList}>
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} style={styles.bulletIcon} />
              <Text style={[styles.bulletText, { color: colors.onSurface }]}>
                Treinamento completo
              </Text>
            </View>
            <View style={styles.bulletList}>
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} style={styles.bulletIcon} />
              <Text style={[styles.bulletText, { color: colors.onSurface }]}>
                Suporte comercial permanente
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Cards de Benefícios */}
        <View style={styles.benefitsContainer}>
          {benefits.map((item, index) => (
            <Card 
              key={index} 
              mode="elevated"
              elevation={3}
              style={[styles.benefitCard, { backgroundColor: colors.surface }]}
            >
              <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons 
                  name={item.icon} 
                  size={32} 
                  color={colors.primary} 
                  style={styles.cardIcon}
                />
                <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.onSurface }]}>
                  {item.title}
                </Text>
                <Text variant="bodyMedium" style={[styles.cardText, { color: colors.onSurfaceVariant }]}>
                  {item.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Card de Chamada Principal */}
       

        {/* Botão de Ação */}
        <Button 
          mode="contained" 
          onPress={handleButtonPress}
          style={[styles.button, { backgroundColor: colors.primary }]}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          Quero Ser um Vendedor!
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    marginTop:65,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  mainTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
    lineHeight: 36,
    fontSize: 25,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  benefitsContainer: {
    marginBottom: 24,
    gap: 16,
  },
  benefitsContainerultimo: {
    backgroundColor: '#FEF7FF',
    marginBottom: 24,
    gap: 16,
  },
  benefitCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    padding: 16,
  },
  cardContent: {
    alignItems: 'center',
    padding: 20,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardText: {
    textAlign: 'center',
    opacity: 0.9,
  },
  cardMainTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  bulletList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletIcon: {
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
  },
  button: {
    borderRadius: 12,
    elevation: 3,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  buttonContent: {
    height: 50,
  },
});