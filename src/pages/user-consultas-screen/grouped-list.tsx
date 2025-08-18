import React, { useRef } from 'react';
import { StyleSheet, FlatList, Animated, View, TouchableOpacity } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import LoadingFull from '../../components/loading-full';
import { useConsultas, ConsultaReposta, ConsultasAgrupadas } from '../../context/consultas-context';
import { navigate } from '../../router/navigationRef';
import { useExames } from '../../context/exames-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

interface GroupedListProps {
  list: ConsultasAgrupadas;
  loading: boolean;
}

const GroupedList = ({ list, loading }: GroupedListProps) => {
  const { colors } = useTheme();
  const { currentProcedureMethod } = useConsultas();
  const { addSelectedExam } = useExames();

  const [openGroups, setOpenGroups] = React.useState<string[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleItemPress = (procedimento: ConsultaReposta) => {
    console.log('handleItemPresssss:', { currentProcedureMethod, procedimento }); // Debug log
    if (currentProcedureMethod === 'exame') {
      addSelectedExam(procedimento);
    } else {
      try {
        navigate('user-procedure-details-screen', { procedimento });
        console.log('Navigated to user-procedure-details-screen:', procedimento);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  };

  const renderAccordion = ({ item, index }: { item: [string, ConsultaReposta[]]; index: number }) => {
    const [grupo, procedimentos] = item;
    const isOpen = openGroups.includes(grupo);

    if (!Array.isArray(procedimentos)) {
      console.warn(`❌ Erro: procedimentos inválido no grupo "${grupo}":`, procedimentos);
      return null;
    }

    if (procedimentos.length === 0) {
      console.log(`No procedures in group "${grupo}"`);
      return null;
    }

    return (
      <Animated.View
        key={`group-${grupo}-${index}`} // Ensure unique key for each accordion
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View
          style={[
            styles.groupContainer,
            {
              backgroundColor: colors.surface,
              marginTop: index === 0 ? 0 : 16,
              shadowColor: colors.shadow,
              elevation: 4,
            },
          ]}
        >
          <TouchableOpacity style={styles.groupHeader} activeOpacity={0.7} onPress={() => setOpenGroups(prev =>
            prev.includes(grupo) ? prev.filter(g => g !== grupo) : [...prev, grupo]
          )}>
            <MaterialIcons name="medical-services" size={28} color={colors.primary} style={styles.groupIcon} />
            <Text variant="titleMedium" style={[styles.accordionTitle, { color: colors.onSurface }]}>
              {grupo}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={28}
              color={colors.onSurfaceVariant}
              style={{
                transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
                marginLeft: 8,
              }}
            />
          </TouchableOpacity>

          {isOpen && (
            <View style={styles.procedimentosContainer}>
              {procedimentos.map((procedimento, idx) => (
                <TouchableOpacity
                  key={`proc-${procedimento.id_procedimento_tpr}-${idx}`} // Unique key for each procedure
                  onPress={() => handleItemPress(procedimento)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.listItem,
                      {
                        backgroundColor: colors.fundo,
                        marginTop: idx === 0 ? 0 : 12,
                      },
                    ]}
                  >
                    <View style={styles.itemContent}>
                      <MaterialIcons
                        name={currentProcedureMethod === 'exame' ? 'science' : 'healing'}
                        size={28}
                        color={colors.primary}
                        style={styles.itemIcon}
                      />
                      <View style={styles.textContainer}>
                        <Text
                          style={[styles.listItemTitle, { color: colors.onSurface }]}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {procedimento.des_descricao_tpr}
                        </Text>
                        <View style={styles.codeContainer}>
                          <MaterialIcons name="tag" size={16} color={colors.onSurfaceVariant} />
                          <Text
                            style={[styles.listItemDescription, { color: colors.onSurfaceVariant }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            Código: {procedimento.id_procedimento_tpr}
                          </Text>
                        </View>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const groupedData = Object.entries(list).filter(
    ([_, procedimentos]) => Array.isArray(procedimentos) && procedimentos.length > 0
  );

  return loading ? (
    <LoadingFull />
  ) : (
    <FlatList
      data={groupedData}
      keyExtractor={(item, index) => `group-${item[0]}-${index}`} // Ensure unique key
      renderItem={renderAccordion}
      style={{
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
      contentContainerStyle={{ paddingBottom: 24 }}
      removeClippedSubviews={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
  },
  groupIcon: {
    marginRight: 12,
  },
  accordionTitle: {
    fontWeight: '700',
    flex: 1,
  },
  procedimentosContainer: {
    paddingVertical: 8,
  },
  listItem: {
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemDescription: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default GroupedList;