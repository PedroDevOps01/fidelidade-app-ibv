import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import UserExamsBottomSheet, { UserExamsBottomSheetRef } from '../pages/user-exams-bottom-sheet';
import { Alert } from 'react-native';
import { toast } from 'sonner-native';

type ExamesContextProps = {
  selectedExams: ConsultaReposta[];
  addSelectedExam: (exam: ConsultaReposta) => void;
  removeSelectedExam: (id: string) => void;
  openBottomSheet: () => void;
  scheduleRequest: ScheduleRequest;
  setScheduleRequestData: (sheduleRequest: ScheduleRequest) => void;
  resetsetSelectedExamsState: () => void;
  clearSelectedExams: () => void;
};

export const initialScheduleRequestState: ScheduleRequest = {
  data_agenda: '',
  cod_empresa: 0,
  cod_pessoa_pes: 0,
  hora_agenda: '',
  hora_agenda_final: '',
  payment_method: '',
  token_paciente: 0,
  procedimentos_array: [],
  vlr_total: 0,
};

const ExamesContext = createContext<ExamesContextProps>({
  selectedExams: [],
  addSelectedExam: () => {},
  removeSelectedExam: () => {},
  openBottomSheet: () => {},
  scheduleRequest: initialScheduleRequestState,
  setScheduleRequestData: () => {},
  resetsetSelectedExamsState: () => {},
  clearSelectedExams: () => {},
});

export const ExamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedExams, setSelectedExamsState] = useState<ConsultaReposta[]>([]);
  const [scheduleRequest, setScheduleRequestState] = useState<ScheduleRequest>(initialScheduleRequestState);

  const bottomSheetRef = useRef<UserExamsBottomSheetRef>(null);

  const setSelectedExamsData = async (exams: ConsultaReposta[]) => {
    setSelectedExamsState(exams);
    await AsyncStorage.setItem('selected_exams', JSON.stringify(exams));
  };

  const addSelectedExam = async (exam: ConsultaReposta) => {
    try {
      if (selectedExams.some(item => item.nome === exam.nome)) {
        throw new Error('Exame já adicionado no carrinho');
      }
      toast.success(`Procedimento ${exam.nome} adicionado ao carrinho!`, { position: 'bottom-center', close: true });

      const updatedItems = [...selectedExams, exam];
      setSelectedExamsState(updatedItems);
      await AsyncStorage.setItem('selected_exams', JSON.stringify(updatedItems));
    } catch (err: any) {
      Alert.alert('Aviso', err.message);
    }
  };

  const removeSelectedExam = async (id: string) => {
    try {
      const updatedItems = selectedExams.filter(e => e.cod_procedimento != id);
      setSelectedExamsState(updatedItems);

      await AsyncStorage.setItem('selected_exams', JSON.stringify(updatedItems));
      toast.success(`Procedimento removido do carrinho!`, { position: 'bottom-center' });
    } catch (err) {
      console.error('Erro ao remover item:', err);
    }
  };

  const setScheduleRequestData = (sheduleRequest: ScheduleRequest) => {
    setScheduleRequestState(sheduleRequest);
  };

  const openBottomSheet = () => {
    bottomSheetRef.current?.openBottomSheet();
  };

  const resetsetSelectedExamsState = () => {
    setSelectedExamsState([]);
  };

  useEffect(() => {
    (async () => {
      const exams = await AsyncStorage.getItem('selected_exams');

      if (exams) {
        const data = JSON.parse(exams) as ConsultaReposta[];
        setSelectedExamsData(data);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedExams.length === 0) {
      bottomSheetRef.current?.closeBottomSheet();
    }
  }, [selectedExams]);

  return (
    <ExamesContext.Provider
      value={{
        selectedExams,
        addSelectedExam,
        removeSelectedExam,
        openBottomSheet,
        scheduleRequest,
        setScheduleRequestData,
        resetsetSelectedExamsState,
        clearSelectedExams: () => setSelectedExamsData([])
      }}>
      {children}
      {selectedExams.length > 0 && <UserExamsBottomSheet ref={bottomSheetRef} />}
    </ExamesContext.Provider>
  );
};

export const useExames = () => {
  const context = useContext(ExamesContext);
  if (!context) {
    throw new Error('useExames must be used within a ExamesProvider');
  }
  return context;
};
