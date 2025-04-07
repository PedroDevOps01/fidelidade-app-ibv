import { z } from "zod";

const newContratoSchema = z.object({
  id_pessoa_ctt: z.number(), //vai vir por props
  id_vendedor_mdv_ctt: z.number().nullable().optional(), // não tem ainda
  id_plano_pagamento_ctt: z.number(), // id das parcelas escolhidas
  id_plano_pagamento_ctt_ctrl: z.number().min(1, "Escolha um plano!"), // controle
  id_situacao_ctt: z.number(), // 15
  id_origem_ctt: z.number(), // 11
  dta_dia_cpc: z.string().refine(
    (value) => {
      const num = Number(value);
      return num >= 1 && num <= 31;
    },
    {
      message: "O valor deve estar entre 1 e 31",
    }
  ), // dia pra pagar
  vlr_parcela_cpc: z.number().nullable().optional(),
  control_forma_pagamento: z.number().optional(),
});

export default newContratoSchema