import dayjs from 'dayjs';
import {z} from 'zod';

const pessoaSchema = z.object({
  id_pessoa_pes: z.number().int(),
  des_nome_pes: z
    .string()
    .min(1, 'Preencha o nome corretamente!')
    .refine(value => value.trim().split(/\s+/).length > 1, {
      message: 'O nome deve conter pelo menos duas palavras.',
    }),
  cod_cpf_pes: z.string().length(11, 'CPF deve ter 11 dígitos').optional(),
  num_whatsapp_pes: z
    .string()
    .min(11, 'Preencha o Whatsapp')
    .transform(value => value.replace(/\D/g, '')), // Mandatory field
  is_ativo_pes: z.number().int().min(0).max(1), // Presumindo que seja um booleano representado como número
  dta_nascimento_pes: z
    .string()
    .refine(date => dayjs(date, 'YYYY-MM-DD', true).isValid(), {
      message: 'Preencha a data corretamente!',
    }),
  num_celular_pes: z
    .string()
    //.min(11, 'Preencha o celular')
    .transform(value => value.replace(/\D/g, ''))
    .nullable().transform((value) => value ?? ""),
  num_telefone_pes: z
    .string()
    //.min(11, 'Preencha o telefone')
    .transform(value => value.replace(/\D/g, ''))
    .nullable().transform((value) => value ?? "")
    .optional(), // Optional field
  des_genero_pes: z.string().min(1, 'Preencha o como quer ser chamado'),
  dth_cadastro_pes: z.string(),
  dth_alteracao_pes: z.string(),
  des_sexo_biologico_pes: z.string().min(1, 'Preencha o sexo biológico!'),
  cod_cep_pda: z.string().length(8, 'CEP deve ter 8 dígitos'),
  des_endereco_pda: z
    .string()
    .min(1, 'Preencha A rua!')
    .refine(value => value.trim().split(/\s+/).length > 1, {
      message: 'O nome deve conter pelo menos duas palavras.',
    }),
  num_endereco_pda: z.string().min(1, 'Preencha o numero!'),
  des_email_pda: z.string().email('Email inválido'),
  des_endereco_completo_pda: z.string().optional(),
  des_bairro_pda: z.string().min(1, 'Preencha o bairro!').optional(),
  dta_emissao_rg_pda: z
  .string()
  .nullable()
  .transform((value) => value ?? "")
  .refine(date => !date || dayjs(date, 'YYYY-MM-DD', true).isValid(), {
    message: 'Preencha a data corretamente!',
  }).optional(),
  des_municipio_mun: z.string(),
  des_estado_civil_pda: z.string().min(1, 'Preencha o estado civil!'),
  cod_rg_pda: z.string().min(5, 'Preencha o numero do RG'),
  id_situacao_pda: z.number().int(),
  //des_descricao_tsi: z.string(),
  des_estado_est: z.string(),
  id_municipio_pda: z.number().min(1, 'Id Municipio!'),
  des_nome_mae_pda: z.string().min(1, 'Preencha o nome da mae').max(120, 'Máximo de 120 caracteres.'),
  vlr_renda_mensal_pda: z.number().min(1, 'Preencha a renda mensal'),
  des_ocupacao_profissional_pda: z.string().min(1, 'Preencha a ocupação').max(120, 'Máximo de 120 caracteres.'),
  des_ponto_referencia_pda: z.string().min(1, "Preencha o ponto de referencia").max(120, "Máximo de 120 caracteres.")
});

export default pessoaSchema;


export type PessoaSchemaFormType = z.infer<typeof pessoaSchema>;