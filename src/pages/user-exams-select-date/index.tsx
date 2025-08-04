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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.card, { backgroundColor: colors.surface }]} mode="elevated">
          <Card.Title 
            title={item.empresa} 
            titleStyle={[styles.cardTitle, { color: colors.onSurface }]}
            subtitle={`${item.cidade} - ${item.estado}`}
            subtitleStyle={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}
            titleNumberOfLines={2}
          />
          
          <Card.Content style={styles.cardContent}>
            <View style={styles.infoSection}>
              <MaterialIcons 
                name="location-on" 
                size={24} 
                color={colors.primary} 
                style={styles.icon} 
              />
              <View style={styles.infoTextContainer}>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  Endereço
                </Text>
                <Text variant="bodyMedium" style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
                  {`${item.endereco}, ${item.numero}`}
                </Text>
                <Text variant="bodyMedium" style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
                  {`${item.bairro}, ${item.cidade} - ${item.estado}`}
                </Text>
              </View>
            </View>

            <Divider style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

            <View style={styles.infoSection}>
              <MaterialIcons 
                name="access-time" 
                size={24} 
                color={colors.primary} 
                style={styles.icon} 
              />
              <View style={styles.infoTextContainer}>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  Horários de Funcionamento
                </Text>
                <Text variant="bodyMedium" style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
                  {`Seg-Sex: ${item.horario_seg_sex_inicio} às ${item.horario_seg_sex_fim}`}
                </Text>
                <Text variant="bodyMedium" style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
                  {`Sábado: ${item.horario_sab_inicio} às ${item.horario_sab_fim}`}
                </Text>
              </View>
            </View>

            <Divider style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

            <View style={[styles.infoSection, { marginBottom: 8 }]}>
              <MaterialIcons 
                name="info" 
                size={24} 
                color={colors.primary} 
                style={styles.icon} 
              />
              <Text variant="bodySmall" style={[styles.infoText, { color: colors.onSurfaceVariant, flex: 1 }]}>
                O atendimento nesta unidade é realizado por ordem de chegada.
              </Text>
            </View>
          </Card.Content>

          <Card.Content style={[styles.dateSection, { backgroundColor: colors.surface2 }]}>
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
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={saveAndContinue}
          contentStyle={styles.continueButtonContent}
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          labelStyle={styles.buttonLabel}
        >
          Continuar
        </Button>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 20,
    paddingTop: 18,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    opacity: 0.8,
  },
  infoSection: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  icon: {
    marginRight: 16,
    marginTop: 2,
  },
  sectionTitle: {
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  infoText: {
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
    opacity: 0.8,
  },
  dateSection: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dateTitle: {
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: 0.15,
  },
  datePickerContainer: {
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  continueButton: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueButtonContent: {
    height: 50,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.1,
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
  },
});