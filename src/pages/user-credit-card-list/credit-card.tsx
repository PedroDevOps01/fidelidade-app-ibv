import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';



const CreditCard = ({card, onDeletePress}: {card: UserCreditCard, onDeletePress: (card_id: string) => void}) => {
  const theme = useTheme();

  const formattedCardNumber = `${card.first_six_digits}******${card.last_four_digits}`;
  const formattedExpiration = `${card.exp_month.toString().padStart(2, '0')}/${card.exp_year}`;
  const isActive = card.status === 'active';

  return (
    <Card mode='elevated' style={styles.card}>
      <Card.Content>
        {/* Card Number and Brand */}
        <View style={styles.row}>
          <Text style={styles.cardNumber}>{formattedCardNumber}</Text>
          <IconButton
            icon={'trash-can-outline'}
            size={30}
            iconColor={theme.colors.primary}
            onPress={() => onDeletePress(card.id)}
            style={{margin: 0}}
          />
        </View>

        {/* Holder Name */}
        <Text style={styles.holderName}>{card.holder_name}</Text>

        {/* Expiration and Status */}
        <View style={styles.row}>
          <Text style={styles.expiration}>Expira: {formattedExpiration}</Text>
          <Text style={[styles.status, isActive ? styles.active : styles.inactive]}>
            {isActive ? 'Ativo' : 'Inativo'}
          </Text>
        </View>

        {/* Billing Address */}
        <View style={styles.billing}>
          <Text style={styles.billingTitle}>Endereço de Cobrança:</Text>
          <Text style={styles.billingText}>{card.billing_address.line_1}</Text>
          <Text style={styles.billingText}>{card.billing_address.city}, {card.billing_address.state}</Text>
          <Text style={styles.billingText}>{card.billing_address.zip_code}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 8,
    borderWidth: 0.3
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  holderName: {
    fontSize: 16,
    marginVertical: 4,
  },
  expiration: {
    fontSize: 14,
    color: '#555',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  active: {
    color: 'green',
  },
  inactive: {
    color: 'red',
  },
  billing: {
    marginTop: 12,
  },
  billingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  billingText: {
    fontSize: 12,
    color: '#555',
  },
});

export default CreditCard;
