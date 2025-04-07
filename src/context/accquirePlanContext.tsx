import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AccquirePlanContextProps {
  voucher: string | null;
  setVoucher: (voucher: string) => void;

  plano: Plano | null;
  setPlano: (plano: Plano) => void;

  idFormaPagamento: number | null;
  setIdFormaPagamento: (idFormaPagamento: number) => void;

  contratoCreated: PessoaContratoNew | null;
  setContratoCreated: (contratoParcela: PessoaContratoNew) => void;

  contratoParcela: ContratoParcela | null;
  setContratoParcela: (contratoParcela: ContratoParcela) => void;

  clearPlano: () => void

}

const initialValue: AccquirePlanContextProps = {
  voucher: null,
  setVoucher: () => {},

  plano: null,
  setPlano: () => {},

  idFormaPagamento: null,
  setIdFormaPagamento: () => {},

  contratoCreated: null,
  setContratoCreated: () => {},

  contratoParcela: null,
  setContratoParcela: () => {},

  clearPlano: () => {},
};


const AccquirePlanContext = createContext<AccquirePlanContextProps>(initialValue);

export const AccquirePlanProvider = ({ children }: { children: ReactNode }) => {
  const [voucherContext, setVoucherContext] = useState<string>();
  const [planoContext, setPlanoContext] = useState<Plano>();
  const [idFormaPagamentoContext, setIdFormaPagamentoContext] = useState<number>();
  const [contratoCreatedContext, setContratoCreatedContext] = useState<PessoaContratoNew>()
  const [contratoParcelaContext, setContratoParcelaContext] = useState<ContratoParcela>()




  return (
    <AccquirePlanContext.Provider
      value={{
        voucher: voucherContext!,
        setVoucher: (voucher: string) => setVoucherContext(voucher),
        plano: planoContext!,
        setPlano: (plano: Plano) => setPlanoContext(plano),
        idFormaPagamento: idFormaPagamentoContext!,
        setIdFormaPagamento: (idFormaPagamento: number) => setIdFormaPagamentoContext(idFormaPagamento),
        contratoCreated: contratoCreatedContext!,
        setContratoCreated: (contrato: PessoaContratoNew) => setContratoCreatedContext(contrato),
        contratoParcela: contratoParcelaContext!,
        setContratoParcela: (contratoParcela: ContratoParcela) => setContratoParcelaContext(contratoParcela),
        clearPlano: () => setPlanoContext(undefined)
      }}
    >
      {children}
    </AccquirePlanContext.Provider>
  );
  
};

export const useAccquirePlan = () => {
  const context = useContext(AccquirePlanContext);
  if (!context) {
    throw new Error("useAccquirePlan must be used within a useAccquirePlanProvider");
  }
  return context;
};
