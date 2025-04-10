import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Divider, Button } from 'react-native-paper';
import { formatDateToDDMMYYYY } from '../../utils/app-utils';

const UserScheduleCard = ({ index, appointment, onPress }: { index: number; appointment: UserSchedule; onPress: (index: number) => void }) => {
  return (
    <Card style={styles.card} mode="contained" onPress={() => onPress(index)}>
      <Card.Title
        title={appointment.nome_profissional}
        subtitle={appointment.contato_paciente ? `Contato: ${appointment.contato_paciente}` : ''}
        left={props => <Avatar.Image {...props} source={{ uri: appointment.fachada_profissional }} size={50} />}
      />
      <Card.Content>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 5 }}>
            <Text variant="titleMedium" style={styles.section}>
              {appointment.nome_procedimento.join(', ')}
            </Text>
          </View>

          <View style={{ flex: 5, justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text variant='bodyLarge' style={{fontWeight: 'bold'}}>Ver mais</Text>
          </View>



          
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 10,
    elevation: 3,
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 10,
  },
});

export default UserScheduleCard;
