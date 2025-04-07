import { z } from "zod";


export const ParceiroSchema = z.object({
    id_parceiro_prc: z.number(),
    des_razao_social_prc : z.string(),
    des_nome_fantasia_prc : z.string(),
    des_endereco_web_prc : z.string(),
    is_parceiro_padrao_prc : z.number(),
    cod_documento_prc : z.string(),
    des_endereco_prc : z.string(),
    des_bairro_prc : z.string(),
    des_complemento_prc : z.string(),
    num_telefone_prc : z.string(),
    num_celular_prc : z.string(),
    is_ativo_prc : z.number(),
    dth_cadastro_prc : z.string(),
    dth_alteracao_prc : z.string(),
    des_municipio_mun : z.string(),
    id_municipio_prc : z.number()
});




export type ParceiroSchemaFormType = z.infer<
  typeof ParceiroSchema
>;