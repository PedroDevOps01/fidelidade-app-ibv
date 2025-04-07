import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import { useTheme } from 'react-native-paper';

type CreditCardProps = {
  number: string;
  holder_name: string;
  exp_month: string;
  exp_year: string;
  brand: string;
};

const UserCreditCard: React.FC<CreditCardProps> = ({number, holder_name, exp_month, exp_year, brand}) => {
  const {colors} = useTheme()

  // const formattedNumber = `${number.slice(0, 4)} ${number.slice(4, 8)} ${number.slice(8, 12)} ${number.slice(12)}`;
  // const formattedExpiration = `${exp_month.padStart(2, '0')}/${exp_year.slice(-2)}`;

  const getBrandLogo = (brand: string) => {
    if (brand) {
      switch (brand.toLowerCase()) {
        case 'visa':
          return require('../../assets/images/visa.jpeg');
        case 'mastercard':
          return require('../../assets/images/mastercard.png');
        default:
          return 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Generic_credit_card.svg';
      }
    }
  };

  return (
    <View style={[styles.card, {backgroundColor: colors.primary}]}>
      {/* Logotipo da Bandeira */}
      <Image source={getBrandLogo(brand)} style={styles.brandLogo} resizeMode="center" />

      {/* Número do Cartão */}
      <Text style={styles.cardNumber}>{number}</Text>

      {/* Nome do Titular e Validade */}
      <View style={styles.details}>
        <Text style={styles.holderName}>{holder_name ? holder_name.toUpperCase() : ''}</Text>
        <Text style={styles.expiration}>
          {exp_month
            ? `
            ${`${exp_month ? exp_month : ''}/${exp_year ? exp_year : ''}`}
          
          `
            : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
    marginVertical: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 0
  },
  brandLogo: {
    width: 60,
    height: 40,
    alignSelf: 'flex-end',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 2,
    marginTop: 20,
    textAlign: 'center',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  holderName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expiration: {
    color: '#fff',
    fontSize: 14,
  },
});

export default UserCreditCard;
