import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { api } from '../../network/api';
import { useAuth } from '../../context/AuthContext';
import { agruparConsultasPorGrupo } from '../../utils/app-utils';
import { Searchbar, Text, useTheme } from 'react-native-paper';
import LoadingFull from '../../components/loading-full';
import CustomToast from '../../components/custom-toast';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface UserProceduresByMedicoProps {
  navigation: any;
  route: any;
}

export default function UserProceduresByMedico({
  navigation,
  route,
}: UserProceduresByMedicoProps) {
  const [consultasAgrupadasData, setConsultasAgrupadasData] = useState<ConsultasAgrupadas>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const { authData } = useAuth();
  const { colors } = useTheme();

  // Animações de fade e slide para os grupos
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
  }, [consultasAgrupadasData]);

  async function fetchProceduresByCodProfessional(cod_profissional: string) {
    try {
      const response = await api.get(
        `/integracao/listProfissionaisProcedimentos?cod_profissional=${cod_profissional}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `bearer ${authData.access_token}`,
          },
        }
      );

      if (response.status == 200) {
        const ag = agruparConsultasPorGrupo(response.data);
        setConsultasAgrupadasData(ag);
      }
    } catch (err: any) {
      navigation.goBack();
      CustomToast('Erro ao carregar horários', colors);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProceduresByCodProfessional(route.params.professional.cod_profissional);
  }, []);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  const filteredData = () => {
    if (!consultasAgrupadasData) return {};

    return Object.entries(consultasAgrupadasData).reduce(
      (acc, [grupo, procedimentos]) => {
        const filteredProcedimentos = procedimentos.filter((procedimento) =>
          procedimento.nome.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredProcedimentos.length > 0) {
          acc[grupo] = filteredProcedimentos;
        }
        return acc;
      },
      {} as ConsultasAgrupadas
    );
  };

  const handleItemPress = (procedimento: ConsultaReposta) => {
    navigation.navigate('user-procedure-details-screen', {
      procedimento: {
        ...procedimento,
        cod_profissional: route.params.professional.cod_profissional,
      },
    });
  };

  const renderAccordion = ({ item, index }: { item: [string, ConsultaReposta[]]; index: number }) => {
    const [grupo, procedimentos] = item;
    const isOpen = openGroups.includes(grupo);

    if (!Array.isArray(procedimentos)) {
      console.warn(`❌ Erro: procedimentos inválido no grupo "${grupo}":`, procedimentos);
      return null;
    }

    return (
      <Animated.View
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
          <TouchableOpacity
            style={styles.groupHeader}
            activeOpacity={0.7}
            onPress={() => toggleGroup(grupo)}
          >
            <MaterialIcons
              name="medical-services"
              size={28}
              color={colors.primary}
              style={styles.groupIcon}
            />
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
                  key={procedimento.cod_procedimento}
                  onPress={() => handleItemPress(procedimento)}
                  activeOpacity={0.8}
                >
                  <Animated.View
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
                        name={'healing'}
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
                          {procedimento.nome}
                        </Text>
                        <View style={styles.codeContainer}>
                          <MaterialIcons name="tag" size={16} color={colors.onSurfaceVariant} />
                          <Text
                            style={[styles.listItemDescription, { color: colors.onSurfaceVariant }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            Código: {procedimento.cod_procedimento}
                          </Text>
                        </View>
                      </View>

                      <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const groupedData = Object.entries(filteredData()).filter(
    ([_, procedimentos]) => Array.isArray(procedimentos) && procedimentos.length > 0
  );

  return (
  <View style={{ flex: 1, backgroundColor: colors.background }}>
    {loading && !consultasAgrupadasData ? (
      <LoadingFull />
    ) : (
      <>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder={'Pesquisar procedimento'}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor: colors.surface }]}
            iconColor={colors.primary}
            inputStyle={{ color: colors.onSurface }}
            placeholderTextColor={colors.onSurfaceVariant}
            elevation={2}
            loading={loading}
          />
        </View>

        <FlatList
          data={groupedData}
          keyExtractor={(item) => item[0]}
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
      </>
    )}
  </View>
);

}

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  loadingOverlay: {
  ...StyleSheet.absoluteFillObject, // faz ocupar toda a tela
  backgroundColor: 'rgba(0,0,0,0.3)', // fundo semitransparente (opcional)
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000, // fica acima de tudo
},
  searchbar: {
    borderRadius: 12,
  },
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
