import React, { createContext, useContext, useState } from 'react';

// Tipos das interfaces
export interface ConsultasAgrupadasData {
  consultasAgrupadas: ConsultasAgrupadas | {};
}

export interface ProcedureTimeDetailsData {
  procedureTimeDetails: Record<string, ProcedureTimeResponse> | {};
}

export type ProcedureMethodTypes = 'consulta' | 'exame' | undefined;

// Estado inicial
const initialConsultasAgrupadasState: ConsultasAgrupadasData = {
  consultasAgrupadas: {},
};

const initialProcedureTimeDetailsState: ProcedureTimeDetailsData = {
  procedureTimeDetails: {},
};

// Contexto
const ConsultasContext = createContext<{
  consultasAgrupadasData: ConsultasAgrupadasData;
  setConsultasAgrupadasData: (data: ConsultasAgrupadas) => void;
  clearConsultasAgrupadasData: () => void;
  procedureTimeDetailsData: ProcedureTimeDetailsData;
  setProcedureTimeDetailsData: (data: Record<string, ProcedureTimeResponse>) => void;
  clearProcedureTimeDetailsData: () => void;
  currentProcedureMethod: ProcedureMethodTypes;
  setCurrentProcedureMethod: (method: ProcedureMethodTypes) => void;
  userSchedules: UserSchedule[];
  setUserSchedulesData: (userSchedule: UserSchedule[]) => void;
}>({
  consultasAgrupadasData: initialConsultasAgrupadasState,
  setConsultasAgrupadasData: () => {},
  clearConsultasAgrupadasData: () => {},
  procedureTimeDetailsData: initialProcedureTimeDetailsState,
  setProcedureTimeDetailsData: () => {},
  clearProcedureTimeDetailsData: () => {},
  currentProcedureMethod: undefined,
  setCurrentProcedureMethod: () => {},
  userSchedules: [],
  setUserSchedulesData: () => {},
});

// Provider
export const ConsultasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consultasAgrupadasData, setConsultasAgrupadasDataState] =
    useState<ConsultasAgrupadasData>(initialConsultasAgrupadasState);

  const [procedureTimeDetailsData, setProcedureTimeDetailsDataState] = useState<ProcedureTimeDetailsData>(
    initialProcedureTimeDetailsState,
  );

  const [currentProcedureMethod, setCurrentProcedureMethodState] = useState<ProcedureMethodTypes>(undefined);
  const [userSchedules, setUserSchedulesState] = useState<UserSchedule[]>([]);
  const [selectedExams, setSelectedExamsState] = useState<ConsultaReposta[]>([]);

  //const bottomSheetRef = useRef<UserExamsBottomSheetRef>(null);

  // Métodos de manipulação do estado
  const setConsultasAgrupadasData = (data: ConsultasAgrupadas) => {
    setConsultasAgrupadasDataState({ consultasAgrupadas: data });
  };

  const clearConsultasAgrupadasData = () => {
    setConsultasAgrupadasDataState(initialConsultasAgrupadasState);
  };

  const setProcedureTimeDetailsData = (data: Record<string, ProcedureTimeResponse>) => {
    setProcedureTimeDetailsDataState({ procedureTimeDetails: data });
  };

  const clearProcedureTimeDetailsData = () => {
    setProcedureTimeDetailsDataState(initialProcedureTimeDetailsState);
  };

  const setCurrentProcedureMethod = (method: ProcedureMethodTypes) => {
    setCurrentProcedureMethodState(method);
  };

  const setUserSchedulesData = (schedules: UserSchedule[]) => {
    setUserSchedulesState(schedules);
  };

  return (
    <ConsultasContext.Provider
      value={{
        consultasAgrupadasData,
        setConsultasAgrupadasData,
        clearConsultasAgrupadasData,
        procedureTimeDetailsData,
        setProcedureTimeDetailsData,
        clearProcedureTimeDetailsData,
        currentProcedureMethod,
        setCurrentProcedureMethod,
        userSchedules,
        setUserSchedulesData,
      }}>
      {children}
    </ConsultasContext.Provider>
  );
};

// Hook personalizado
export const useConsultas = () => {
  const context = useContext(ConsultasContext);
  if (!context) {
    throw new Error('useConsultas must be used within a ConsultasProvider');
  }
  return context;
};
