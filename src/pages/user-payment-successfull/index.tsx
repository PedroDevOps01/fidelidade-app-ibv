import React from 'react';
import { StyleSheet, View, Dimensions, Animated, Easing } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { goHome } from '../../router/navigationRef';
import { useConsultas } from '../../context/consultas-context';
import { initialScheduleRequestState, useExames } from '../../context/exames-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type UserPaymentSuccessfullRouteParams = {
  params: {
    name: string;
  };
};

export default function UserPaymentSuccessfull() {
  const { colors } = useTheme();
  const { currentProcedureMethod } = useConsultas();
  const { setScheduleRequestData, resetsetSelectedExamsState } = useExames();
  const route = useRoute<RouteProp<UserPaymentSuccessfullRouteParams>>();
  
  const scaleValue = React.useRef(new Animated.Value(0.5)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;
  const checkmarkScale = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Animação de entrada do card
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start(() => {
      // Animação do checkmark após o card aparecer
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handlePress = () => {
    if (currentProcedureMethod === 'exame' || currentProcedureMethod === 'consulta') {
      setScheduleRequestData(initialScheduleRequestState);
      resetsetSelectedExamsState();
    }
    goHome();
  };

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
      <Animated.View 
        style={[
          styles.animatedContainer, 
          { 
            transform: [{ scale: scaleValue }],
            opacity: opacityValue
          }
        ]}
      >
        <Card mode="elevated" style={[styles.card, { backgroundColor: colors.surface }]}>
          

          <Card.Content style={styles.content}>
            <Text variant="headlineSmall" style={[styles.title, { color: colors.primary }]}>
              Agendamento Confirmado!
            </Text>
            
            <View style={styles.messageContainer}>
              <Text variant="bodyMedium" style={[styles.message, { color: colors.onSurface }]}>
                Seu pagamento foi processado com sucesso e seu agendamento está confirmado.
              </Text>
              <Text variant="bodyMedium" style={[styles.message, { color: colors.onSurface, marginTop: 8 }]}>
                Você receberá um e-mail com todos os detalhes.
              </Text>
            </View>
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              onPress={handlePress}
              style={[styles.button, { backgroundColor: colors.primary }]}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              Voltar ao Início
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 100,
  },
  animatedContainer: {
    width: '90%',
    maxWidth: 400,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  iconContainer: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
  },
  checkmarkBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  messageContainer: {
    marginVertical: 8,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    paddingHorizontal: 0,
    marginTop: 16,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 2,
    elevation: 0,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});