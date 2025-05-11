import {View, Image, StyleSheet} from 'react-native';
import {Card, Text, useTheme, Divider} from 'react-native-paper';

export default function ProcedureItem({procedure, navigation}: {procedure: ProcedureResponse; navigation: any}) {
  return (
    <Card
      mode='outlined'
      style={[styles.card]}
      onPress={() => {
        navigation.navigate('user-procedure-time', {procedimento: procedure});
      }}>
      <Card.Content style={styles.content}>
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.title}>
            {procedure.empresa}
          </Text>
          <Text variant="bodyMedium" style={styles.address}>
            {`${procedure.endereco}, ${procedure.numero}`}
          </Text>
          <Text variant="bodyLarge" style={styles.price}>
            {`Assinante R$: ${procedure.valor_assinatura}`}
          </Text>
          <Text variant="bodyLarge" style={styles.price}>
            {`Particular R$: ${procedure.valor_particular}`}
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image source={{uri: procedure.fachada_empresa}} style={styles.image} />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginVertical: 8,
    elevation: 4, // Adiciona sombra no Android
    shadowColor: '#000', // Adiciona sombra no iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    maxHeight: 180,
    borderRadius: 16,
    padding: 16,
  },
  textContainer: {
    flex: 7,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
  },
  divider: {
    marginVertical: 8,
  },
  price: {
    marginTop: 4,
    fontWeight: '500',
  },
  imageContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
