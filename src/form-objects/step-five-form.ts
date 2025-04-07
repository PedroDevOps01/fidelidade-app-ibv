import dayjs from 'dayjs';
import {z} from 'zod';

export const stepFiveSchema = z.object({
  hash_senha_usr: z
    .string()
    .min(1, { message: "Preencha a senha!" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,14}$/,
      {
        message:
          "Sua senha deve ter entre 8 e 14 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.",
      }
    )
});
