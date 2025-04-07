import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Text, Button, useTheme, IconButton} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {navigate, reset} from '../../router/navigationRef';
import { useConsultas } from '../../context/consultas-context';
import { initialScheduleRequestState, useExames } from '../../context/exames-context';


type UserPaymentSuccessfullRouteParams = {
  params: {
    name: string;
  };
};


export default function UserPaymentSuccessfull() {
  const {colors} = useTheme();
  const {currentProcedureMethod} = useConsultas();
  const {setScheduleRequestData, resetsetSelectedExamsState} = useExames()
  const route = useRoute<RouteProp<UserPaymentSuccessfullRouteParams>>()


  const handlePress = () => {

    if(currentProcedureMethod === 'exame') {
      setScheduleRequestData(initialScheduleRequestState)
      resetsetSelectedExamsState()
      reset([{name: "user-schedules-screen"}], 0)
    }

    if(currentProcedureMethod === 'consulta') {
      setScheduleRequestData(initialScheduleRequestState)
      resetsetSelectedExamsState()
      reset([{name: "user-schedules-screen"}], 0)
    }


    else {
      reset([{name: "logged-home-screen"}])
    }


    // if(route.params) {
    //   console.log(route.params.name)
    //   reset([{name: }], 0)
    // }
  }




  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Card mode="contained" style={styles.card}>
        <View style={styles.iconContainer}>
          <IconButton icon="check-circle" size={64} iconColor={colors.primary} style={styles.icon} />
        </View>

        <Card.Content>
          <Text style={styles.title}>Pagamento Realizado com Sucesso!</Text>
          <Text style={styles.message}>
            Seu pagamento está sendo processado no momento. Agora, você pode continuar utilizando nossos serviços.
          </Text>
        </Card.Content>
        
        <Button
          mode="contained"
          onPress={handlePress} // Substitua 'HomeScreen' pela rota desejada
          style={{marginTop: 10}}>
          Continuar
        </Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20
  },
  button: {},
});