import { z } from "zod";
import  { isValidCPF } from '../utils/app-utils';

export const CpfCheckSchema = z.object({
  cpf: z
  .string()
  .min(11, "Preencha o CPF ou CNPJ!")
  .transform((value) => value.replace(/\D/g, '')) // Remove all non-digit characters
  //.refine(isValidCPF, { message: "CPF inválido!" })
});
