import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Avatar, Button, useTheme, Icon } from 'react-native-paper';
import { applyPhoneMask, formatDateToDDMMYYYY } from '../../utils/app-utils';

const UserScheduleCard = ({ index, appointment, onPress }: { index: number; appointment: UserSchedule; onPress: (index: number) => void }) => {
  const { colors } = useTheme();

  return (
    <Card style={[styles.card]} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <View style={styles.headerContainer}>
          <Avatar.Image
            source={{ uri: appointment.fachada_profissional }}
            size={50}
            style={[styles.avatar, { backgroundColor: 'transparent' }]}
          />
          <View style={styles.headerTextContainer}>
            <Text variant="titleMedium" style={[styles.professionalName, { color: colors.onBackground }]}>
              {appointment.nome_profissional}
            </Text>
            <Text variant="bodyMedium" style={[styles.contact, { color: colors.onSurfaceVariant }]}>
              {appointment.contato_paciente ? `Contato: ${applyPhoneMask(appointment.contato_paciente)}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.infoRow}>
            <Icon source="calendar" size={20} color={colors.primary} />
            <Text variant="bodyLarge" style={[styles.section, { color: colors.onBackground }]}>
              {formatDateToDDMMYYYY(appointment.data)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon source="stethoscope" size={20} color={colors.primary} />
            <Text variant="bodyLarge" style={[styles.section, { color: colors.onBackground }]}>
              {appointment.nome_procedimento.join(', ')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.buttonContainer, { backgroundColor: colors.primary }]}
          onPress={() => onPress(index)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Ver mais</Text>
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4, // Sombra suave para profundidade
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Borda sutil
  },
  cardContent: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  professionalName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  contact: {
    fontSize: 14,
    marginTop: 4,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  section: {
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserScheduleCard;