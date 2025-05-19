import dayjs from 'dayjs';
import { z } from 'zod';

export const stepFourSchema = z.object({
  num_celular_pes: z
    .string()
    .min(11, 'Preencha o Num. Celular') // Optional field
    .transform(value => value.replace(/\D/g, '')),

  num_telefone_pes: z
    .string()
    // .min(10, 'Preencha o Num. Celular')
    .nullable() // Optional field
    .transform(value => {

      if (!value) return null

      let num = `${value}0`
      return num!.replace(/\D/g, '')
    }),

  num_whatsapp_pes: z
    .string()
    .min(11, 'Preencha o Whatsapp')
    .transform(value => value.replace(/\D/g, '')), // Mandatory field
});
