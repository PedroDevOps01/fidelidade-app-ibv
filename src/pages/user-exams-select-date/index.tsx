import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useCallback, useState } from 'react';
import { Alert, Modal, Platform, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, useTheme } from 'react-native-paper';
import { useExames } from '../../context/exames-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import { ScrollView } from 'react-native-gesture-handler';
import { navigate } from '../../router/navigationRef';
import CustomDatePicker from '../../components/custom-date-picker';

type UserExamsSelectDateRouteParams = {
  params: {
    item: ExamsLocals;
  };
};

export default function UserExamsSelectDate() {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<UserExamsSelectDateRouteParams>>();
  const { item } = route.params;
  const { scheduleRequest, setScheduleRequestData } = useExames();

  const [date, setDate] = useState<Date>(new Date());
  const [show, setShow] = useState<boolean>(false);

  // Calcula as datas mínimas e máximas
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14); // Limita os próximos 14 dias

  function saveAndContinue() {
    let data: ScheduleRequest = {
      ...scheduleRequest,
      data_agenda: dayjs(date).format('YYYY-MM-DD'),
    };

    setScheduleRequestData(data);

    navigate('user-select-payment-method');

    //console.log(JSON.stringify(data, null, 2));
  }

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      // Validação: Não permitir domingos
      if (selectedDate.getDay() === 0) {
        Alert.alert('Data Inválida', 'Domingos não são permitidos. Escolha outro dia.');
      }
      // Validação: Limitar ao intervalo de hoje até 14 dias
      else if (selectedDate > maxDate) {
        Alert.alert('Data Inválida', 'Selecione uma data entre hoje e os próximos 14 dias.');
      } else {
        setDate(selectedDate); // Atualiza a data apenas se for válida
      }
    }

    if (Platform.OS == 'android') {
      setShow(false); // Fecha o DatePicker
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card} mode="contained">
        <Card.Cover source={{ uri: item.fachada_empresa }} style={[styles.image, { backgroundColor: colors.surfaceVariant }]} />
        <Card.Title title={item.empresa} />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.sectionTitle}>
            Endereço
          </Text>
          <Text>{`${item.endereco}, ${item.numero}, ${item.bairro}, ${item.cidade} - ${item.estado}`}</Text>

          <Divider style={styles.divider} />

          <Text variant="bodyMedium" style={styles.sectionTitle}>
            Horários de Funcionamento
          </Text>
          <Text>{`Seg-Sex: ${item.horario_seg_sex_inicio} às ${item.horario_seg_sex_fim}`}</Text>
          <Text>{`Sábado: ${item.horario_sab_inicio} às ${item.horario_sab_fim}`}</Text>

          <Divider style={styles.divider} />

          <Text variant="bodySmall">O atendimento nesta unidade é realizado por ordem de chegada.</Text>

          <Card.Actions>
            <View style={{ width: '100%' }}>
              <Text variant="bodyMedium" style={{ marginBottom: 10, textAlign: 'center' }}>
                Selecione uma data:
              </Text>

              {/* <Button mode="contained" onPress={() => setShow(true)} contentStyle={{ width: '100%' }}>
                {date ? dayjs(date).format('DD/MM/YYYY') : 'Selecionar Data'}
              </Button> */}

              <CustomDatePicker
                value={date}
                onChange={onChange}
                mode="date"
                label="Data"
              />
            </View>
          </Card.Actions>
        </Card.Content>
      </Card>

      <View style={{ paddingHorizontal: 12 }}>
        <Button
          mode="contained"
          onPress={() => {
            saveAndContinue();
          }}
          contentStyle={{ width: '100%' }}>
          Continuar
        </Button>
      </View>

      {/* Modal apenas para iOS */}
      {Platform.OS === 'ios' && (
        <Modal transparent={true} visible={show} onRequestClose={() => setShow(false)}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: colors.surfaceVariant }]}>
              <RNDateTimePicker value={date} minimumDate={today} maximumDate={maxDate} display="spinner" onChange={onChange} locale="pt-BR" themeVariant="light" />

              <Button mode="contained" onPress={() => setShow(false)}>
                Confirmar
              </Button>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && show && <RNDateTimePicker value={date} mode="date" display="default" minimumDate={today} maximumDate={maxDate} onChange={onChange} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  card: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    height: 150,
  },
  sectionTitle: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
