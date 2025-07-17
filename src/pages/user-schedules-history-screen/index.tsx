import { Button, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import LoadingFull from '../../components/loading-full';
import { api } from '../../network/api';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { generateRequestHeader } from '../../utils/app-utils';
import { useFocusEffect } from '@react-navigation/native';
import UserScheduleCard from '../user-schedules-screen/user-schedule-card';
import ScheduleDataModal from '../user-schedules-screen/schedule-data-modal';
import CustomToast from '../../components/custom-toast';

const UserSchedulesHistoryScreen = () => {
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();
  const { authData } = useAuth();

  const [loading, setLoading] = useState(true);
  const [userSchedules, setUserSchedules] = useState<UserSchedule[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [listItemIndex, setListItemIndex] = useState<number>(0);

  async function fetchSchedules() {
    const token = dadosUsuarioData.pessoaDados?.cod_token_pes!;

    if (token == undefined) {
      CustomToast('Erro ao carregar os dados. Tente novamente mais tarde!', colors);
      return;
    }

    try {
      const response = await api.get(`/integracao/listHistoricoAgendamentos?token_paciente=${token}`, generateRequestHeader(authData.access_token));
      const { data } = response;

      if (data.length > 0) {
        setUserSchedules(data);
      }
    } catch {
      CustomToast('Erro ao carregar os dados. Tente novamente mais tarde!', colors);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await fetchSchedules();
    })();
  }, []);

  const NoSchedulesComponent = () => (
    <View style={[styles.containerErrorComponent, { backgroundColor: colors.background }]}>
      <IconButton icon="calendar-remove-outline" size={64} iconColor={colors.primary} style={styles.icon} />
      <Text variant="headlineMedium" style={styles.text}>
        Você não possui agendamentos marcados
      </Text>
      <Button onPress={fetchSchedules}>Recarregar</Button>
    </View>
  );
  function showModal(e: number) {
    console.log(e);
    setListItemIndex(e);
    setIsModalVisible(true);
  }
  return (
    <View style={[styles.container, { backgroundColor: '#e7d7ff' }]}>
      {loading ? (
        <LoadingFull />
      ) : (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {userSchedules.length > 0 ? (
            <FlatList
              style={{ width: '100%' }}
              data={userSchedules}
              renderItem={({ item, index }) => (
                <UserScheduleCard
                  index={index}
                  appointment={item}
                  onPress={e => showModal(e)}
                  showCheckinButton={false} // desabilita o botão check-in no histórico
                  setGlobalLoading={setLoading} // se sua prop existir, mantenha aqui para evitar erro
                />
              )}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSchedules} />}
              removeClippedSubviews={false}
            />
          ) : (
            <NoSchedulesComponent />
          )}
          <Portal>
            {userSchedules.length > 0 ? <ScheduleDataModal appointment={userSchedules[listItemIndex!]} visible={isModalVisible} close={() => setIsModalVisible(false)} /> : <></>}
          </Portal>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerErrorComponent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginBottom: 16,
  },
  text: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'red',
    color: 'white',
  },
  fabStyle: {
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 0,
  },
});

export default UserSchedulesHistoryScreen;
