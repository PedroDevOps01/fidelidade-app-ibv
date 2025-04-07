import { Button, Divider, Modal, Text } from 'react-native-paper';
import { formatDateToDDMMYYYY } from '../../utils/app-utils';
import { StyleSheet, View } from 'react-native';

export default function ScheduleDataModal({ appointment, visible, close }: { appointment: UserSchedule; visible: boolean; close: () => void }) {
  return (
    <Modal contentContainerStyle={styles.container} visible={visible}>
      <View style={{ flex: 10 }}>
        <View style={{ flex: 2 }}>
          <Text variant="titleLarge" style={{ marginTop: 16, marginLeft: 8, fontWeight: 'bold' }}>
            {appointment.nome_unidade}
          </Text>
        </View>

        <Divider />

        <View style={{ flex: 6, padding: 8 }}>
          <Text variant="bodyLarge">
            Endereço: {appointment.endereco_unidade}, {appointment.numero_unidade}, {appointment.bairro_unidade}, {appointment.cidade_unidade} - {appointment.estado}
          </Text>

          <Text variant="bodyLarge" style={styles.section}>
            Data: {formatDateToDDMMYYYY(appointment.data)} | Horário: {String(appointment.inicio)}
          </Text>
        </View>

        <Divider />

        <View style={{ flex: 2, justifyContent: 'center', paddingHorizontal: 6 }}>
          <Button mode="contained" onPress={close}>
            Fechar
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    height: '50%',
    padding: 4
  },
  card: {
    margin: 10,
    borderRadius: 10,
    elevation: 3,
  },
  section: {
    marginTop: 8,
  },
});
