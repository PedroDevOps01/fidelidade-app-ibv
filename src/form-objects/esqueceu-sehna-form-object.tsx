import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidCPF } from "../utils/app-utils";
import dayjs from "dayjs";


const esqueceuSenhaSchema = z.object({
  cod_cpf_pes: z
    .string()
    .refine(isValidCPF, { message: "CPF inválido!" })
    .transform((val) => val.replace(/\D/g, "")),
  dta_nascimento_pes: z.string().refine(date => dayjs(date, 'YYYY-MM-DD', true).isValid(), {
      message: 'Preencha a data corretamente!',
    }),
});

export type EsqueceuSenhaFormSchemaType = z.infer<typeof esqueceuSenhaSchema>;

export { esqueceuSenhaSchema };