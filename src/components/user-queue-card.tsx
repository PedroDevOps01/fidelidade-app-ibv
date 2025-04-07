import { View, StyleSheet } from 'react-native';
import { Card, Text, Divider } from 'react-native-paper';



type Props = {
  data: PacienteFila;
};

const UserQueueCard = ({ data }: Props) => {
  return (
    <Card style={styles.card}>
      <View style={styles.ticketTop}>
        <Text style={styles.title}>{data.paciente}</Text>
        <Text style={styles.subTitle}>#{data.agenda_exames_id}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.ticketBody}>
        <View>
          <Text style={styles.label}>Especialidade</Text>
          <Text style={styles.value}>{data.especialidade.toLocaleUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, styles.status]}>{data.status}</Text>
        </View>
        <View>
          <Text style={styles.label}>Posiçãao na fila</Text>
          <Text style={styles.ordemFila}>{data.ordem_fila}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 0,
    padding: 16,
    borderRadius: 0,
    backgroundColor: '#fff',
    alignSelf: 'stretch', // <- garante que se estenda se o pai permitir
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#d1d5db',
  },
  ticketBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  status: {
    textTransform: 'uppercase',
  },
  ordemFila: {
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center'
  },
});

export default UserQueueCard;
