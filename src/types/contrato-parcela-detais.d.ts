type ContratoParcelaDetails = {
  id_contrato_parcela_config_cpc: number;
  dta_dia_cpc: string;
  dta_mes_cpc: string;
  vlr_parcela_cpc: number;
  id_contrato_cpc: number;
  is_ativo_cpc: number;
  dth_cadastro_cpc: string; // Pode ser Date se preferir transformar
  dth_alteracao_cpc: string; // Pode ser Date se preferir transformar
  id_usr_cadastro_cpc: number;
  id_usr_alteracao_cpc: number;
  valor_pago?: string;
  ano_pagamento?: string;
  des_nome_fmp?: string;
  des_descricao_tsi?: string;
  cod_numparcela_cpc: number;
};

