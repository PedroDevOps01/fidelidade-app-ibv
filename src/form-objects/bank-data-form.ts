import { z } from "zod";

export const pessoaDadosBancariosSchema = z.object({
  codBancoPdb: z.string().min(1, "Preencha o banco!"),
  codAgenciaPdb: z.string().min(4, "Preencha o banco!"),
  codAgenciaValidadorPdb: z.string().min(1, "Preencha o Dig. verificador!"),
  codNumContaPdb: z.string().min(4, "Preencha o banco!"),
  codContaValidadorPdb: z.string().min(1, "Preencha o Dig. verificador!"),
  desTipoPdb: z.string().min(1, "Preencha o tipo da conta!"),
});

export type PessoaFormDadosBancariosSchemaType = z.infer<typeof pessoaDadosBancariosSchema>;