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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
  maxDate.setDate(today.getDate() + 14);

  function saveAndContinue() {
    let data: ScheduleRequest = {
      ...scheduleRequest,
      data_agenda: dayjs(date).format('YYYY-MM-DD'),
    };

    setScheduleRequestData(data);
    navigate('user-select-payment-method');
  }

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (selectedDate.getDay() === 0) {
        Alert.alert('Data Inválida', 'Domingos não são permitidos. Escolha outro dia.');
      } else if (selectedDate > maxDate) {
        Alert.alert('Data Inválida', 'Selecione uma data entre hoje e os próximos 14 dias.');
      } else {
        setDate(selectedDate);
      }
    }

    if (Platform.OS == 'android') {
      setShow(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={[styles.card, {     backgroundColor: '#FFFFFF',
 }]} mode="elevated">
        <Card.Cover 
          source={{ uri: item.fachada_empresa }} 
          style={styles.image} 
          theme={{ colors: { outline: 'transparent' }}} 
        />
        
        <Card.Title 
          title={item.empresa} 
          titleStyle={styles.cardTitle}
          subtitle={`${item.cidade} - ${item.estado}`}
          subtitleStyle={{ color: colors.onSurfaceVariant }}
        />
        
        <Card.Content style={{backgroundColor: '#FFFFFF'}}>
          <View style={styles.infoSection}>
            <MaterialIcons name="location-on" size={20} color={colors.primary} style={styles.icon} />
            <View>
              <Text variant="bodyMedium" style={styles.sectionTitle}>
                Endereço
              </Text>
              <Text style={styles.infoText}>
                {`${item.endereco}, ${item.numero}\n${item.bairro}, ${item.cidade} - ${item.estado}`}
              </Text>
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: colors.outline }]} />

          <View style={styles.infoSection}>
            <MaterialIcons name="access-time" size={20} color={colors.primary} style={styles.icon} />
            <View>
              <Text variant="bodyMedium" style={styles.sectionTitle}>
                Horários de Funcionamento
              </Text>
              <Text style={styles.infoText}>
                {`Seg-Sex: ${item.horario_seg_sex_inicio} às ${item.horario_seg_sex_fim}`}
              </Text>
              <Text style={styles.infoText}>
                {`Sábado: ${item.horario_sab_inicio} às ${item.horario_sab_fim}`}
              </Text>
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: colors.outline }]} />

          <View style={[styles.infoSection, { marginBottom: 16 }]}>
            <MaterialIcons name="info" size={20} color={colors.primary} style={styles.icon} />
            <Text variant="bodySmall" style={[styles.infoText, { flex: 1 }]}>
              O atendimento nesta unidade é realizado por ordem de chegada.
            </Text>
          </View>

          <Card.Actions style={styles.dateSection}>
            <Text variant="titleMedium" style={[styles.dateTitle, { color: colors.primary }]}>
              Selecione uma data
            </Text>
            <View style={styles.datePickerContainer}>
              <CustomDatePicker
                value={date}
                onChange={onChange}
                mode="date"
                label="Data"
                accentColor={colors.primary}
              />
            </View>
          </Card.Actions>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={saveAndContinue}
        contentStyle={styles.continueButton}
        style={[styles.continueButton, { backgroundColor: colors.primary }]}
        labelStyle={styles.buttonLabel}
      >
        Continuar
      </Button>

      {/* Modal apenas para iOS */}
      {Platform.OS === 'ios' && (
        <Modal transparent={true} visible={show} onRequestClose={() => setShow(false)}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <RNDateTimePicker 
                value={date} 
                minimumDate={today} 
                maximumDate={maxDate} 
                display="spinner" 
                onChange={onChange} 
                locale="pt-BR"
                accentColor={colors.primary}
              />
              <Button 
                mode="contained" 
                onPress={() => setShow(false)}
                style={{ marginTop: 16 }}
                labelStyle={styles.buttonLabel}
              >
                Confirmar
              </Button>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && show && (
        <RNDateTimePicker 
          value={date} 
          mode="date" 
          display="default" 
          minimumDate={today} 
          maximumDate={maxDate} 
          onChange={onChange} 
          accentColor={colors.primary}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  card: {
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  image: {
    backgroundColor: '#FFFFFF',
    paddingTop:20,
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  infoSection: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    color: '#444',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  dateSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginTop: 8,
  },
  dateTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  datePickerContainer: {
    width: '100%',
  },
  continueButton: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 12,
    margin: 16,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});