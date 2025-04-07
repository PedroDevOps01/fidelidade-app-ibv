import {z} from 'zod';

const MAX_FILE_SIZE = 2097152;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
];

export const productParceiroSchema = z.object({
  id_produto_parceiro_ppc: z.number().optional(),
  id_parceiro_ppc: z.number(),
  des_nome_produto_ppc: z
    .string()
    .min(1, 'Preencha um nome')
    .max(150, 'Tamanho máximo'),
  desc_produto_ppc: z
    .string()
    .min(1, 'Preencha um nome')
    .max(255, 'Tamanho máximo'),
  vlr_produto_ppc: z.string().min(1, 'Preencha um valor'),

  // a foto será enviada
  url_img_produto_ppc: z
    .array(
      z.object({
        name: z.string(),
        uri: z.string(), // A URL ou caminho do arquivo local
        size: z.number().max(MAX_FILE_SIZE, 'Tamanho da imagem apenas até 2MB'),
        type: z.string().refine(type => ACCEPTED_IMAGE_TYPES.includes(type), {
          message: 'Formato de imagem não suportado',
        })
      }),
    )
    .min(1, 'Selecione pelo menos uma imagem')
    .optional(),
  id_usr_cadastro_ppc: z.number(),
  dta_vencimento_produto_ppc: z.string().min(1, 'Insira uma datade vencimento'),
  is_ativo_ppc: z.number().optional(),
  id_categoria_ppc: z.number().min(1, 'Preencha a categoria')
});



export type ProductParceiroSchemaFormType = z.infer<
  typeof productParceiroSchema
>;
