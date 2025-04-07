type ScheduleRequest = {
  data_agenda: string;
  hora_agenda: string;
  hora_agenda_final?: string;
  token_paciente: number;
  cod_pessoa_pes: number;
  cod_horarioagenda?: number;
  cod_agenda?: number;
  cod_procedimento?: number;
  vlr_procedimento?: number;
  cod_empresa: number;
  cod_profissional?: number;
  cod_sala?: number;
  payment_method: string | null;
  card_id?: number;
  procedimentos_array?: ExamsProcedures[];
  vlr_total?: number
};
