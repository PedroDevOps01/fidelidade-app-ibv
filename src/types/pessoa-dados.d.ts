type PessoaDados = {
  id_pessoa_pda: number;
  cod_cep_pda: string;
  des_endereco_pda: string;
  num_endereco_pda: string;
  des_bairro_pda: string;
  id_municipio_pda: number;
  des_estado_civil_pda: string;
  cod_rg_pda: string;
  dta_emissao_rg_pda: string;
  des_email_pda: string;
  des_endereco_completo_pda: string;
  id_situacao_pda: number;
  id_usr_cadastro_pda: number;
  id_usr_alteracao_pda: number;
  dth_alteracao_pda: string;
  dth_cadastro_pda: string;
  id_pessoa_dados_pda: number;
  usuario_id?: number;
  id_pessoa_pes?: number;
  des_nome_pes?: string;
  cod_cpf_pes?: string;
  is_ativo_pes?: number;
  dth_cadastro_pes?: string;
  dth_alteracao_pes?: string;
  id_usr_cadastro_pes?: number;
  id_usr_alteracao_pes?: number;
  num_telefone_pes?: string;
  num_celular_pes?: string;
  num_whatsapp_pes?: string;
  dta_nascimento_pes?: string;
  des_sexo_biologico_pes?: string;
  des_genero_pes?: string;
  id_parceiro_pes?: number;
  cod_token_pes?: number;
  des_uf_rg_pda?: string;
  des_estado_est?: string;
  des_municipio_mun?: string;
  des_descricao_tsi?: string;
  des_nome_mae_pda: string;
  vlr_renda_mensal_pda: number;
  des_ocupacao_profissional_pda: string;
  des_ponto_referencia_pda: string;
  is_assinado_pes?: number; // Added to track if the user has signed the terms
};

  