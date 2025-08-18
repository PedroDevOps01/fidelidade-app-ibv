import React, { createContext, useContext, useState } from 'react';

// Define the structure of a single procedure
export interface ConsultaReposta {
  id_procedimento_tpr: number;
    cod_procedimento_rpi: number;
id_parceiro_rpi: number;
  des_descricao_tpr: string;
  des_grupo_tpr?: string;
  is_ativo_tpr: number;
  dth_cadastro_tpr: string;
  dth_alteracao_tpr: string;
  id_usr_cadastro_tpr: number;
  id_usr_alteracao_tpr: number;
  des_tipo_tpr: string;
}

export interface ConsultasAgrupadas {
  [key: string]: ConsultaReposta[];
}

export interface ConsultasAgrupadasData {
  consultasAgrupadas: ConsultasAgrupadas;
}

export interface ProcedureTimeResponse {
  [key: string]: any;
}

export interface ProcedureTimeDetailsData {
  procedureTimeDetails: Record<string, ProcedureTimeResponse>;
}

export interface UserSchedule {
  [key: string]: any;
}

export type ProcedureMethodTypes = 'consulta' | 'exame' | undefined;

const initialConsultasAgrupadasState: ConsultasAgrupadasData = {
  consultasAgrupadas: {},
};

const initialProcedureTimeDetailsState: ProcedureTimeDetailsData = {
  procedureTimeDetails: {},
};

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

export const ConsultasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consultasAgrupadasData, setConsultasAgrupadasDataState] =
    useState<ConsultasAgrupadasData>(initialConsultasAgrupadasState);
  const [procedureTimeDetailsData, setProcedureTimeDetailsDataState] =
    useState<ProcedureTimeDetailsData>(initialProcedureTimeDetailsState);
  const [currentProcedureMethod, setCurrentProcedureMethodState] = useState<ProcedureMethodTypes>('consulta');
  const [userSchedules, setUserSchedulesState] = useState<UserSchedule[]>([]);

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
      }}
    >
      {children}
    </ConsultasContext.Provider>
  );
};

export const useConsultas = () => {
  const context = useContext(ConsultasContext);
  if (!context) {
    throw new Error('useConsultas must be used within a ConsultasProvider');
  }
  return context;
};