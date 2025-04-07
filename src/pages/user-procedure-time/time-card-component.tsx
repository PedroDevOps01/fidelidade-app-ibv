import { Image, View, StyleSheet, TouchableOpacity } from 'react-native';
import { List, Text, useTheme, Divider } from 'react-native-paper';
import { formatDateWithDayOfWeek, formatTimeToHHMM } from '../../utils/app-utils';
import { FlatList } from 'react-native-gesture-handler';
import React from 'react';
import { useConsultas } from '../../context/consultas-context';

interface TimeCardComponentProps {
  procedure: Record<string, ProcedureTimeResponse[]>;
  onSelect: (proc: Record<string, ProcedureTimeResponse>) => void;
  currentSelectedProcedure: Record<string, ProcedureTimeResponse> | undefined;
}

function TimeCardComponent({ procedure, onSelect, currentSelectedProcedure }: TimeCardComponentProps) {
  const { colors } = useTheme();

  const { setProcedureTimeDetailsData } = useConsultas();

  return (
    <List.Section>
      {Object.entries(procedure).map(([date, proceduresArray]) => (
        <View key={date}>
          <List.Subheader style={[styles.sectionHeader, { color: colors.primary }]}>{formatDateWithDayOfWeek(date)}</List.Subheader>
          <View style={styles.scheduleContainer}>
            {proceduresArray.map((e, i) => (
              <View key={i} style={[styles.card, { backgroundColor: colors.surfaceVariant }]}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={[styles.professionalName, { color: colors.onSurface }]}>
                      {e.nome_profissional}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.professionalDetails, { color: colors.onSurfaceVariant }]}>
                      {`CRM: ${e.conselho_profissional}`}
                    </Text>
                  </View>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: e.fachada_profissional }} style={styles.professionalImage} />
                  </View>
                </View>
                <View>
                  <FlatList
                    horizontal
                    style={{marginTop: 4}}
                    data={e.horarios_list.map(e => e.split(':').slice(0, 2).join(':'))}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeButton,
                          { borderColor: colors.primary, borderWidth: 2 },
                          // { backgroundColor: colors.surfaceVariant },
                          // currentSelectedProcedure?.[date]?.selected_time === item && {
                          //   borderColor: colors.primary,
                          //   borderWidth: 2,
                          // },
                        ]}
                        onPress={() => {
                          const currentData: Record<string, ProcedureTimeResponse> = {
                            [date]: {
                              ...e,
                              selected_time: formatTimeToHHMM(item),
                            },
                          };
                          //onSelect(currentData); // Mantém apenas a atualização necessária
                          setProcedureTimeDetailsData(currentData);
                        }}>
                        <Text style={styles.timeText}>{formatTimeToHHMM(item)}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            ))}
          </View>
          <Divider style={{ marginVertical: 10 }} />
        </View>
      ))}
    </List.Section>
  );
}

export default React.memo(TimeCardComponent);

const styles = StyleSheet.create({
  sectionHeader: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 0,
    textAlign: 'left',
    paddingLeft: 6,
  },
  scheduleContainer: {
    padding: 12,
  },
  card: {
    borderWidth: 0,
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
  },
  textContainer: {
    flex: 7,
    justifyContent: 'center',
  },
  professionalName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  professionalDetails: {
    fontSize: 14,
  },
  imageContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  professionalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  timeButton: {
    paddingVertical: 10, // Altura do botão controlada pelo padding
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5, // Espaçamento entre os botões
    //elevation: 2, // Sombras no Android
    // shadowColor: '#000', // Sombras no iOS
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    minWidth: 100,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
