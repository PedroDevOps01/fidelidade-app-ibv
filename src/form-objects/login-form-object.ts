import { z } from "zod";

export const LoginSchema = z.object({
  cpf: z
    .string()
    .min(11, "Preencha o CPF!"),
    //.regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX!"),
  password: z.string().min(6, "Preencha a senha!"),
});
