import { isValid, z } from 'zod';
import { isValidCPF } from '../utils/app-utils';

const CreditCardSchema = z.object({
  id_pessoa_pes: z.number().int().positive(), // ID da pessoa, deve ser um número inteiro positivo
  number: z
    .string()
    .regex(/^\d{13,19}$/, "O número do cartão deve ter entre 13 e 19 dígitos"), // Número do cartão de 13 a 19 dígitos
  holder_name: z
    .string()
    .min(3, "O nome do titular deve ter pelo menos 3 caracteres")
    .max(100, "O nome do titular não pode exceder 100 caracteres"), // Nome do titular
  holder_document: z
    .string()
    .regex(/^\d{11}$/, "O CPF deve conter 11 dígitos")
    .refine(isValidCPF, {
       message: "CPF inválido"
    }), // CPF com 11 dígitos
  exp_month: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, "O mês de validade deve ser entre 01 e 12"), // Mês de validade no formato MM
  exp_year: z
    .string()
    .regex(/^\d{4}$/, "O ano de validade deve ter 4 dígitos")
    .refine((year) => Number(year) >= new Date().getFullYear(), "O ano de validade deve ser atual ou futuro"), // Ano de validade
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "O CVV deve conter 3 ou 4 dígitos"), // CVV de 3 ou 4 dígitos
  brand: z
    .string()
    .regex(/^(visa|mastercard|amex|discover|elo|jcb|diners|hipercard)$/, "Bandeira inválida"), // Bandeiras válidas
});

// Exporta o schema para uso
export type CreditCardSchemaFormType = z.infer<typeof CreditCardSchema>;

export { CreditCardSchema };
