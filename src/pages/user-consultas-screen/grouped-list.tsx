import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { List, useTheme, Text } from 'react-native-paper';
import LoadingFull from '../../components/loading-full';
import { useConsultas } from '../../context/consultas-context';
import { navigate } from '../../router/navigationRef';
import { useExames } from '../../context/exames-context';

interface GroupedListProps {
  list: ConsultasAgrupadas;
  loading: boolean;
}

const GroupedList = ({list, loading}: GroupedListProps) => {
  const {colors} = useTheme();

  const {currentProcedureMethod} = useConsultas();
  const {addSelectedExam} = useExames();

  const renderAccordion = ({item}: {item: [string, ConsultaReposta[]]}) => {
    const [grupo, procedimentos] = item;

    return (
      <List.Accordion
        title={grupo}
        id={grupo}
        style={[styles.groupContainer, {backgroundColor: colors.surface}]}
        titleStyle={[styles.accordionTitle, {color: colors.primary}]}>
        <FlatList
          data={procedimentos}
          keyExtractor={procedimento => procedimento.cod_procedimento}
          renderItem={({item: procedimento}) => (
            <List.Item
              title={<Text style={[styles.listItemTitle, {color: colors.onSurface}]}>{procedimento.nome}</Text>}
              description={
                <Text
                  style={[
                    styles.listItemDescription,
                    {color: colors.onSurfaceVariant},
                  ]}>{`Código: ${procedimento.cod_procedimento}`}</Text>
              }
              style={[styles.listItem, {backgroundColor: colors.surface, borderBottomColor: colors.onSurfaceVariant}]}
              onPress={() => {
                if (currentProcedureMethod == 'exame') {
                  addSelectedExam(procedimento);
                } else {
                  navigate('user-procedure-details-screen', {
                    procedimento,
                  });
                }
              }}
              removeClippedSubviews={false}
            />
          )}
        />
      </List.Accordion>
    );
  };

  const groupedData = Object.entries(list); // Converte o objeto em um array para uso no FlatList

  return (
    <>
      {loading ? (
        <LoadingFull title="Carregando..." />
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={item => item[0]} // O nome do grupo será a chave
          renderItem={renderAccordion}
          style={{backgroundColor: colors.background}}
          removeClippedSubviews={false}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    borderRadius: 0,
    marginVertical: 0,
    elevation: 4,
  },
  listItem: {
    paddingLeft: 20,
    marginTop: 0,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 14,
  },
});

export default GroupedList;
