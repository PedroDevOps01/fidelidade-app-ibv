type ProdutoParceiroResponse = {
  id_produto_parceiro_ppc: number;
  id_parceiro_ppc: number;
  des_nome_produto_ppc: string;
  desc_produto_ppc: string;
  vlr_produto_ppc: string;
  url_img_produto_ppc: string;
  dta_vencimento_produto_ppc: string;
  is_ativo_ppc: number;
  dth_cadastro_ppc: string;
  dth_alteracao_ppc: string;
  id_usr_cadastro_ppc: number;
  id_usr_alteracao_ppc: number | null;
  des_razao_social_prc: string;
  des_nome_fantasia_prc: string;
  obs_item_crt?: string;
  id_categoria_ppc : number;
  nome_categoria_cpp : string;

};
