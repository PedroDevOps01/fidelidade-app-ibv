import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { log } from '../utils/app-utils';

export type Pessoa = {
  cod_cpf_pes: string;
  des_nome_pes: string;
  num_whatsapp_pes: string;
  num_telefone_pes: string;
  num_celular_pes: string;
  dta_nascimento_pes: string;
  des_sexo_biologico_pes: string;
  des_genero_pes: string | null;
  id_usr_cadastro_pes: number;
  id_usr_alteracao_pes: number;
  dth_alteracao_pes: string;
  dth_cadastro_pes: string;
  id_pessoa_pes: number;
  id_usuario_usr: number;
  is_assinado_pes: number; // Added
  cod_cep_pda?: string; // Added if stored in tb_pessoa
};

export type DadosUsuario = {
  pessoa?: Pessoa;
  pessoaDados?: PessoaDados;
  pessoaAssinatura?: PessoaAssinatura;
  errorCadastroPagarme?: ErrorCadastroPagarme | null;
  pessoaMdv?: PessoaMdv[] | null;
  user: User;
};

const initialState: DadosUsuario = {
  pessoa: {
    cod_cpf_pes: '',
    des_nome_pes: '',
    num_whatsapp_pes: '',
    num_telefone_pes: '',
    num_celular_pes: '',
    dta_nascimento_pes: '',
    des_sexo_biologico_pes: '',
    des_genero_pes: '',
    id_usr_cadastro_pes: 0,
    id_usr_alteracao_pes: 0,
    dth_alteracao_pes: '',
    dth_cadastro_pes: '',
    id_pessoa_pes: 0,
    id_usuario_usr: 0,
    is_assinado_pes: 0, // Added
    cod_cep_pda: '', // Added if stored in tb_pessoa
  },
  pessoaDados: {
    id_pessoa_pda: 0,
    cod_cep_pda: '', // Used here if stored in tb_pessoa_dados
    des_endereco_pda: '',
    num_endereco_pda: '',
    des_bairro_pda: '',
    id_municipio_pda: 0,
    des_estado_civil_pda: '',
    cod_rg_pda: '',
    dta_emissao_rg_pda: '',
    des_email_pda: '',
    des_endereco_completo_pda: '',
    id_situacao_pda: 0,
    id_usr_cadastro_pda: 0,
    id_usr_alteracao_pda: 0,
    dth_alteracao_pda: '',
    dth_cadastro_pda: '',
    id_pessoa_dados_pda: 0,
    des_nome_mae_pda: '',
    des_ocupacao_profissional_pda: '',
    des_ponto_referencia_pda: '',
    vlr_renda_mensal_pda: 0,
  },
  user: {
    des_nome_pes: '',
    dth_alteracao_usr: '',
    dth_cadastro_usr: '',
    id_origem_usr: 0,
    id_pessoa_usr: 0,
    id_usr_alteracao_usr: 0,
    id_usr_cadastro_usr: 0,
    id_usuario_usr: 0,
    is_ativo_usr: 0,
        is_assinado_pes: 0, // Added

    is_first_access_usr: false,
  },
};

// cartoes
const initialUserCreditCardsState: UserCreditCard[] = [];

// contratos
const initialUserContractsState: ContratoResponse[] = [];

const DadosUsuarioContext = createContext<{
  dadosUsuarioData: DadosUsuario;
  setDadosUsuarioData: (data: DadosUsuario) => Promise<void>;
  clearDadosUsuarioData: () => Promise<void>;
  clearLoginDadosUsuarioData: () => Promise<void>;
  userCreditCards: UserCreditCard[];
  setCreditCards: (data: UserCreditCard[]) => void;
  clearCreditCards: () => void;
  userContracts: ContratoResponse[];
  setContracts: (data: ContratoResponse[]) => void;
  clearContracts: () => void;
}>({
  dadosUsuarioData: initialState,
  setDadosUsuarioData: async () => {},
  clearDadosUsuarioData: async () => {},
  clearLoginDadosUsuarioData: async () => {},
  userCreditCards: initialUserCreditCardsState,
  setCreditCards: (data: UserCreditCard[]) => {},
  clearCreditCards: () => {},
  userContracts: initialUserContractsState,
  setContracts: (data: ContratoResponse[]) => {},
  clearContracts: () => {},
});

export const DadosUsuarioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dadosUsuarioData, setDadosUsuarioState] = useState<DadosUsuario>(initialState);
  const [userCreditCards, setUserCreditCards] = useState<UserCreditCard[]>(initialUserCreditCardsState);
  const [userContracts, setUserContracts] = useState<ContratoResponse[]>(initialUserContractsState);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const savedUserData = await AsyncStorage.getItem('user_data');
        if (savedUserData) {
          setDadosUsuarioState(JSON.parse(savedUserData));
        }
      } catch (error) {
        console.error('Failed to load user data from storage:', error);
      }
    };

    initializeData();
  }, []);

  const setDadosUsuarioData = async (data: DadosUsuario) => {
    try {
      setDadosUsuarioState(data);
      await AsyncStorage.setItem('user_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user data to storage:', error);
    }
  };

  const clearDadosUsuarioData = async () => {
    try {
      setDadosUsuarioState(initialState);
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  };

  const clearLoginDadosUsuarioData = async () => {
    try {
      await AsyncStorage.removeItem('user_login_data');
    } catch (error) {
      console.error('Failed to clear login data:', error);
    }
  };

  const setCreditCards = (data: UserCreditCard[]) => {
    if (data.length > 0) {
      setUserCreditCards(data);
    } else {
      setUserCreditCards(initialUserCreditCardsState);
    }
  };
  const clearCreditCards = () => {
    setUserCreditCards(initialUserCreditCardsState);
  };

  const setContracts = (data: ContratoResponse[]) => {
    if (data.length > 0) {
      setUserContracts(data);
    } else {
      setUserContracts(initialUserContractsState);
    }
  };
  const clearContracts = () => {
    setUserContracts(initialUserContractsState);
  };

  return (
    <DadosUsuarioContext.Provider
      value={{
        dadosUsuarioData,
        setDadosUsuarioData,
        clearDadosUsuarioData,
        clearLoginDadosUsuarioData,
        userCreditCards,
        setCreditCards,
        clearCreditCards,
        userContracts,
        setContracts,
        clearContracts,
      }}
    >
      {children}
    </DadosUsuarioContext.Provider>
  );
};

export const useDadosUsuario = () => {
  const context = useContext(DadosUsuarioContext);
  if (!context) {
    throw new Error('useDadosUsuario must be used within a DadosUsuarioProvider');
  }
  return context;
};