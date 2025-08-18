import React from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { Dialog, Portal, Button, Text, useTheme, Divider } from 'react-native-paper';
import { navigate } from '../../router/navigationRef';
import { formatDateToDDMMYYYY } from '../../utils/app-utils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface UserSchedule {
  nome_procedimento: string | string[];
  nome_profissional?: string;
  data: string;
  inicio: string;
  fachada_profissional?: string;
}

interface ProximosAgendamentosDialogProps {
  schedules: UserSchedule[] | null | undefined;
  visible: boolean;
  navigation: any;
  handlePress: (status: boolean) => void;
}

const ProximosAgendamentosDialog = ({ schedules, visible, navigation, handlePress }: ProximosAgendamentosDialogProps) => {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: visible ? 1 : 0.9,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const getDaysUntil = (scheduleDate: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cria a data do agendamento manualmente para ignorar fuso
    const [year, month, day] = scheduleDate.split('T')[0].split('-').map(Number);
    const localSchedule = new Date(year, month - 1, day);
    localSchedule.setHours(0, 0, 0, 0);

    const diffTime = localSchedule.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 0) return 'Passado';
    return `${diffDays} dias`;
  };

  const getDaysUntilColor = (scheduleDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = scheduleDate.split('-').map(Number);
    const schedule = new Date(year, month - 1, day);
    schedule.setHours(0, 0, 0, 0);

    const diffTime = schedule.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return colors.primary;
    if (diffDays === 1) return colors.tertiary;
    if (diffDays < 0) return colors.error;
    return colors.onSurfaceVariant;
  };

  // Ordena os agendamentos por data e horário
  const sortedSchedules = schedules
    ? [...schedules].sort((a, b) => {
        const dateA = new Date(`${a.data}T${a.inicio}`);
        const dateB = new Date(`${b.data}T${b.inicio}`);
        return dateA.getTime() - dateB.getTime();
      })
    : [];

  return (
    <Portal>
      <Dialog
        visible={visible}
        style={[
          styles.dialog,
          {
            backgroundColor: colors.onPrimaryContainer,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        dismissable
        onDismiss={() => handlePress(false)}>
        <Dialog.Title style={[styles.title]}>
          <View style={styles.titleContainer}>
            <Text variant="titleLarge" style={[styles.titleText, { color: colors.onSurface }]}>
              Agendamentos Marcados
            </Text>
          </View>
        </Dialog.Title>

        <Divider style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

        <Dialog.Content>
          <ScrollView style={styles.schedulesContainer} contentContainerStyle={styles.scrollContent}>
            {sortedSchedules.length ? (
              sortedSchedules.map((schedule, index) => (
                <View
                  key={index}
                  style={[
                    styles.scheduleItem,
                    {
                      borderColor: colors.primaryContainer,
                      borderWidth: 1,
                      backgroundColor: colors.onSecondary,
                      marginBottom: index === sortedSchedules.length - 1 ? 0 : 12,
                    },
                  ]}>
                  <View style={styles.scheduleHeader}>
                    <MaterialIcons name="medical-services" size={20} color={colors.primary} />
                    <Text variant="bodyLarge" style={[styles.procedureText, { color: colors.onSurface }]}>
                      {Array.isArray(schedule.nome_procedimento) ? schedule.nome_procedimento.join(', ') : schedule.nome_procedimento}
                    </Text>
                  </View>

                  <View style={styles.scheduleDetailRow}>
                    <MaterialIcons name="person" size={16} color={colors.primary} />
                    <Text variant="bodyMedium" style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
                      {schedule.nome_profissional || 'Profissional não informado'}
                    </Text>
                  </View>

                  <View style={styles.scheduleDetailRow}>
                    <MaterialIcons name="event" size={16} color={colors.primary} />
                    <Text variant="bodyMedium" style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
                      {formatDateToDDMMYYYY(schedule.data)} às {schedule.inicio.slice(0, 5)}
                    </Text>
                    <View style={[styles.daysBadge, { backgroundColor: getDaysUntilColor(schedule.data) }]}>
                      <Text style={styles.daysText}>{getDaysUntil(schedule.data)}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.noSchedulesText, { color: colors.onSurfaceVariant }]}>
                Nenhum agendamento encontrado.
              </Text>
            )}
          </ScrollView>
        </Dialog.Content>

        <Divider style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

        <Dialog.Actions style={styles.actions}>
          <Button
            onPress={() => handlePress(false)}
            mode="outlined"
            style={[styles.button, { borderColor: colors.primary }]}
            labelStyle={[styles.buttonLabel, { color: colors.primary }]}
            contentStyle={styles.buttonContent}>
            Agora não
          </Button>
          <Button
            onPress={() => {
              handlePress(false);
              navigate('user-schedules');
            }}
            mode="contained"
            style={[styles.button, { backgroundColor: colors.primary }]}
            labelStyle={[styles.buttonLabel, { color: colors.onPrimary }]}
            contentStyle={styles.buttonContent}
            icon="calendar-arrow-right">
            Agendamentos
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 16,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxHeight: '80%', // Limita a altura do diálogo
  },
  title: {
    paddingBottom: 0,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  schedulesContainer: {
    maxHeight: 300, // Define uma altura máxima para o ScrollView
  },
  scrollContent: {
    paddingVertical: 8,
  },
  scheduleItem: {
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  procedureText: {
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  scheduleDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  detailText: {
    marginLeft: 8,
    flex: 1,
  },
  daysBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  daysText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noSchedulesText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  button: {
    borderRadius: 12,
    minWidth: '48%',
  },
  buttonContent: {
    height: 44,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ProximosAgendamentosDialog;