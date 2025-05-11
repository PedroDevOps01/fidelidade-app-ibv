import { createContext, ReactNode, useContext, useState } from 'react';

const initialState: PessoaCreateData = {
  cod_cpf_pes: '',
  des_nome_pes: '',
  num_telefone_pes: null,
  num_celular_pes: null,
  num_whatsapp_pes: 0,
  dta_nascimento_pes: '',
  des_sexo_biologico_pes: 'M',
  des_genero_pes: '',
  cod_cep_pda: '',
  des_endereco_pda: '',
  num_endereco_pda: '',
  des_endereco_completo_pda: '',
  des_bairro_pda: '',
  id_municipio_pda: null,
  des_estado_civil_pda: 'solteiro',
  cod_rg_pda: '',
  dta_emissao_rg_pda: '',
  des_email_pda: '',
  id_situacao_pda: '1',
  id_usuario_usr: 1,
  des_ocupacao_profissional_pda: '',
  des_ponto_referencia_pda: '',
  vlr_renda_mensal_pda: 100,
  des_nome_mae_pda: '',
  tipo: 'NEW_USER',
};

interface PessoaCreateContextProps {
  pessoaCreateData: PessoaCreateData;
  setPessoaCreateData: (data: PessoaCreateData) => void;
  clearPessoaCreateData: () => void;
}

const PessoaCreateContext = createContext<PessoaCreateContextProps>({
  pessoaCreateData: initialState,
  setPessoaCreateData: () => {},
  clearPessoaCreateData: () => {},
});

export const PessoaCreateProvider = ({ children }: { children: ReactNode }) => {
  const [pessoaCreateData, setPessoaCreateDataState] =
    useState<PessoaCreateData>(initialState);

  const setPessoaCreateData = (data: PessoaCreateData) => {
    setPessoaCreateDataState(data);
  };

  const clearPessoaCreateData = () => {
    setPessoaCreateDataState(initialState);
  };

  return (
    <PessoaCreateContext.Provider
      value={{
        pessoaCreateData,
        setPessoaCreateData,
        clearPessoaCreateData,
      }}
    >
      {children}
    </PessoaCreateContext.Provider>
  );
};

export const usePessoaCreate = () => {
  const context = useContext(PessoaCreateContext);
  if (!context) {
    throw new Error('usePessoaCreate must be used within a PessoaCreateProvider');
  }
  return context;
};
