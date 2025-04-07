import {z} from 'zod';

export const stepTwoSchema = z.object({
  cod_cep_pda: z.string().min(1, 'Preencha o CEP!'),
  des_endereco_pda: z
    .string()
    .min(1, 'Preencha A rua!')
    .refine(value => value.trim().split(/\s+/).length > 1, {
      message: 'O nome deve conter pelo menos duas palavras.',
    }),
  num_endereco_pda: z.string().min(1, 'Preencha o numero!'),
  des_endereco_completo_pda: z
    .string().optional(),
  des_bairro_pda: z.string().min(1, 'Preencha o bairro!').optional(),
  id_municipio_pda: z.number().min(1, 'Id Municipio!'),
  des_ponto_referencia_pda: z.string().min(1, "Preencha o ponto de referencia").max(120, "Máximo de 120 caracteres.").default('Não tem'),
});
