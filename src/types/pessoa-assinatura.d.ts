type PessoaAssinatura = {
  des_nome_pes: string;
  des_nome_pla: string;
  qtd_parcelas_ctt: number;
  vlr_inicial_ctt: number;
  is_ativo_ctt: number;
  id_contrato_ctt: number;
  dth_cadastro_ctt: string;
  des_origem_ori: string;
  des_descricao_tsi: string;
  assinatura_liberada: boolean;
  inadimplencia: PessoaAssinaturaInadimplencia[];
};
