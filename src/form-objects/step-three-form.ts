import dayjs from 'dayjs';
import { z } from 'zod';

export const stepThreeSchema = z.object({
  des_sexo_biologico_pes: z.string().min(1, 'Preencha o sexo biológico!'),
  des_genero_pes: z.string().min(1, 'Preencha o como quer ser chamado'),
  des_estado_civil_pda: z.string().min(1, 'Preencha o estado civil!'),
  cod_rg_pda: z.string().min(5, 'Preencha o numero do RG'),
  dta_emissao_rg_pda: z
    .string()
    .optional()
    .refine(date => !date || dayjs(date, 'YYYY-MM-DD', true).isValid(), {
      message: 'Preencha a data corretamente!',
    }),
  des_email_pda: z.string().email('Formato de email inválido!'),
  id_situacao_pda: z.string().min(1, 'Preencha a situação!'),
  des_nome_mae_pda: z.string().min(1, 'Preencha o nome da mae').max(120, 'Máximo de 120 caracteres.'),
  vlr_renda_mensal_pda: z.number().min(1, 'Preencha a renda mensal').default(100),
  des_ocupacao_profissional_pda: z.string().min(1, 'Preencha a ocupação').max(120, 'Máximo de 120 caracteres.'),
});
