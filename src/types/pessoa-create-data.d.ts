type PessoaCreateData = {
  cod_cpf_pes: string;
  des_nome_pes: string;
  num_telefone_pes?: number | null;
  num_celular_pes?: number | null;
  num_whatsapp_pes: number ;
  dta_nascimento_pes: string;
  des_sexo_biologico_pes: string;
  des_genero_pes: string;
  cod_cep_pda: string;
  des_endereco_pda: string;
  num_endereco_pda: string;
  des_endereco_completo_pda: string;
  des_bairro_pda: string;
  id_municipio_pda: number | null;
  des_estado_civil_pda: string;
  cod_rg_pda: string;
  dta_emissao_rg_pda: string;
  des_email_pda: string;
  id_situacao_pda: string;
  id_usuario_usr: number;
  vlr_renda_mensal_pda: number,
  des_ocupacao_profissional_pda: string,
  des_ponto_referencia_pda: string,
  des_nome_mae_pda: string
  is_assinado_pes: number;
  tipo: "NEW_USER" | "DEPENDENT"
};