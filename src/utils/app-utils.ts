import axios from 'axios';
import { api } from '../network/api';
import { CannotRefreshTokenException } from '../exceptions/cannot-refreshtoken-exception';
import dayjs from 'dayjs';

export const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, ''); // Remove all non-numeric characters
  if (cpf.length !== 11) return false;

  let sum = 0;
  let remainder;

  // Check for invalid CPFs (all digits the same)
  if (
    cpf === '00000000000' ||
    cpf === '11111111111' ||
    cpf === '22222222222' ||
    cpf === '33333333333' ||
    cpf === '44444444444' ||
    cpf === '55555555555' ||
    cpf === '66666666666' ||
    cpf === '77777777777' ||
    cpf === '88888888888' ||
    cpf === '99999999999'
  )
    return false;

  // Validate first digit
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;

  // Validate second digit
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

export const validateEmail = (email: string): boolean => {
  // Expressão regular para validar o formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Testa o email contra a expressão regular
  return emailRegex.test(email);
};

export const applyCpfMask = (value: string): string => {
  return value
    .replace(/\D/g, '') // Remove all non-digit characters
    .replace(/(\d{3})(\d)/, '$1.$2') // Add dot after the third digit
    .replace(/(\d{3})(\d)/, '$1.$2') // Add dot after the sixth digit
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Add hyphen before the last two digits
};

export const applyCnpjMask = (value: string): string => {
  // Remove todos os caracteres não numéricos e limita a 14 dígitos
  const numericValue = value.replace(/\D/g, '').slice(0, 14);

  // Aplica a máscara de CNPJ
  return numericValue
    .replace(/^(\d{2})(\d)/, '$1.$2') // Adiciona ponto após o segundo dígito
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Adiciona ponto após o quinto dígito
    .replace(/\.(\d{3})(\d{4})/, '.$1/$2') // Adiciona barra após o oitavo dígito
    .replace(/(\d{4})(\d{2})$/, '$1-$2'); // Adiciona hífen antes dos últimos dois dígitos
};


export const applyPhoneMask = (value: string | number, qtd: number = 11): string => {
  if (!value) {
    return '';
  }
  // Convert the input to a string if it is a number
  const stringValue = typeof value === 'number' ? value.toString() : value;

  if (stringValue) {
    return stringValue
      .replace(/\D/g, '') // Remove all non-digit characters
      .slice(0, qtd) // Ensure the value has at most 11 digits (which corresponds to 15 characters with the mask)
      .replace(/(\d{2})(\d)/, '($1) $2') // Add parentheses around the area code
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2'); // Add hyphen before the last four digits
  } else {
    return value as string;
  }
};

export const limitTextLength = (value: string | number, maxLength: number): string => {
  // Convert the input to a string if it is a number
  const stringValue = typeof value === 'number' ? value.toString() : value;

  // Use a regular expression to remove all non-digit characters and limit the length
  return stringValue.slice(0, maxLength); // Limit the length of the string to maxLength
};

export const getAddressByCep = async (cep: string) => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    const { data } = response;
    return data;
  } catch (err: any) {
    throw new Error('Erro ao carregar CEP!');
  }
};

export const getMunicipioId = async (municipio: string) => {
  try {
    const response = await api.get(`/municipio?des_municipio_mun=${municipio}`);
    const { data } = response;
    const municpioId = data.response.data.filter((e: any) => e.des_municipio_mun === municipio)[0].id_municipio_mun;
    return municpioId;
  } catch (err: any) {
    throw new Error('Erro ao consultar dados. Tente mais tarde.');
  }
};

interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 8 || password.length > 14) {
    return {
      valid: false,
      message: 'Sua senha deve ter entre 8 e 14 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.',
    };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,14}$/;

  if (!passwordRegex.test(password)) {
    return {
      valid: false,
      message: 'Sua senha deve ter entre 8 e 14 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.',
    };
  }

  return {
    valid: true,
  };
}

export async function refreshNewToken(currentToken: string, onError: () => void) {
  try {
    const request = await api.post(
      '/refresh',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `bearer ${currentToken}`,
        },
      },
    );

    const data: LoginResponse = request.data;

    if (data.authorization) {
      return data.authorization;
    } else {
      onError();
      throw new Error('Erro ao atualizar token');
    }
  } catch (err) {
    //console.log(err);
    onError();
    throw new CannotRefreshTokenException('Sua sessão expirou. Faça login novamente.');
  }
}

export function maskBrazilianCurrency(value: string | number): string {
  // Converte o valor para string e remove todos os caracteres que não sejam números
  let numericValue = value.toString().replace(/\D/g, '');

  // Garante pelo menos 3 dígitos (ex: "8" → "008", "85" → "085")
  numericValue = numericValue.padStart(3, '0');

  // Adiciona a vírgula antes dos dois últimos dígitos
  numericValue = numericValue.replace(/(\d{2})$/, ',$1');

  // Adiciona os pontos de milhar
  numericValue = numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

  return `R$ ${numericValue}`;
}


export const convertToReais = (value: string | number): string => {
  // Verifica e converte a entrada se for uma string
  if (typeof value === 'string') {
    // Remove qualquer caractere não numérico
    value = value.replace(/[^0-9]/g, '');

    // Converte para número
    value = Number(value);
  }

  // Verifica se o valor convertido é um número válido
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Invalid input value. Please provide a valid number or numeric string.');
  }

  // Converte o valor de centavos para reais
  const reais = value / 100;

  // Formata o valor em reais como uma string com duas casas decimais e separador de milhar
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const createRequestHeader = (accessToken: string) => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `bearer ${accessToken}`,
  };
};

export const transformMonthNumberToString = (month: number) => {
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  if (month < 1 || month > 12) {
    throw new Error('Número do mês inválido. Deve ser entre 1 e 12.');
  }

  return monthNames[month - 1];
};

export function toPreciseInteger(number: number) {
  const decimalPlaces = number.toString().split('.')[1]?.length || 0;
  return Math.floor(number * Math.pow(10, decimalPlaces));
}
export interface ConsultaReposta {
  id_procedimento_tpr: number;
  cod_procedimento_rpi: number;
  des_descricao_tpr: string;
  des_grupo_tpr?: string;
  is_ativo_tpr: number;
  dth_cadastro_tpr: string;
  dth_alteracao_tpr: string;
  id_usr_cadastro_tpr: number;
  id_usr_alteracao_tpr: number;
  des_tipo_tpr: string;
}
export function agruparConsultasPorGrupo(procedimentos: ConsultaReposta[]): { consultasAgrupadas: Record<string, ConsultaReposta[]> } {
  if (!Array.isArray(procedimentos)) {
    console.warn('agruparConsultasPorGrupo: Input data is not an array', procedimentos);
    return { consultasAgrupadas: {} };
  }

  const grouped = procedimentos.reduce((acc: Record<string, ConsultaReposta[]>, procedimento) => {
    const grupo = procedimento.des_tipo_tpr || 'Outros'; // Use des_grupo_tpr
    if (!acc[grupo]) {
      acc[grupo] = [];
    }
    acc[grupo].push(procedimento);
    return acc;
  }, {});

  return { consultasAgrupadas: grouped };
}

export function formatDateToDDMMYYYY(dateString: string): string {
  // Divide a string da data em partes
  const [year, month, day] = dateString.split('-');

  // Retorna a data formatada no formato dd/MM/yyyy
  return `${day}/${month}/${year}`;
}

export function formatDateWithDayOfWeek(dateString: string): string {
  // Divide a string de data em partes (yyyy-MM-dd)
  const [year, month, day] = dateString.split('-').map(Number);

  // Cria um objeto Date (atenção ao índice do mês, que começa em 0)
  const date = new Date(year, month - 1, day);

  // Usa Intl.DateTimeFormat para formatar a data completa
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const formattedDate = new Intl.DateTimeFormat('pt-BR', options).format(date);

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export async function logout(access_token: string) {
  try {
    await api.post(
      '/logout',
      {},
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${access_token}`,
        },
      },
    );
    console.log('logout successfull');
  } catch (err: any) {
    console.log('logout err: ', JSON.stringify(err, null, 2));
  }
}

export function getCurrentDate(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function getCardBrand(cardNumber: string) {
  if (cardNumber) {
    const cleanedNumber = cardNumber.replace(/\D/g, ''); // Remove caracteres não numéricos
    const firstSix = cleanedNumber.slice(0, 6);
    const firstFour = cleanedNumber.slice(0, 4);
    const firstTwo = cleanedNumber.slice(0, 2);
    const firstOne = cleanedNumber.slice(0, 1);

    if (/^4/.test(cleanedNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanedNumber) || /^2(2[2-9]|[3-7])/.test(firstSix)) return 'mastercard';
    if (/^3[47]/.test(cleanedNumber)) return 'American Express';
    if (/^6(?:011|5|4[4-9]|22[1-9])/.test(firstSix)) return 'discover';
    if (/^35(2[8-9]|[3-8])/.test(firstSix)) return 'jcb';
    if (/^3(?:0[0-5]|[68])/.test(firstTwo)) return 'diners Club';
    if (/^(606282|3841)/.test(firstSix) || /^38[4-9]/.test(firstFour)) return 'hipercard';
    if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6362|6363|5041)/.test(firstFour) || /^(6277|6278|6504|6505)/.test(firstFour)) return 'Elo';
  } else {
    return 'Unknown';
  }
}

export function generateRequestHeader(access_token: string) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `bearer ${access_token}`,
    },
  };
}

export function convertStringToNumber(value: string): number {
  // Remover a pontuação (ponto ou vírgula)
  const sanitizedValue = value.replace('.', '');

  // Converter para número inteiro
  const result = Number(sanitizedValue);

  return result;
}

export function convertExamsLocalsToScheduleRequest(examLocals: ExamsLocals, codPessoa: number, dataAgenda: string, tokenPaciente: number): ScheduleRequest {
  let data: ScheduleRequest = {
    data_agenda: dataAgenda, //date_format:Y-m-d',
    cod_empresa: Number(examLocals.cod_empresa),
    cod_pessoa_pes: codPessoa,
    hora_agenda: examLocals.horario_seg_sex_inicio,
    hora_agenda_final: examLocals.horario_seg_sex_fim,
    payment_method: '',
    token_paciente: tokenPaciente,
    procedimentos_array: [],
    vlr_total: 0,
  };

  return data;
}

export function formatTimeToHHMM(time: string): string {
  // Validação inicial
  if (!time || typeof time !== 'string') {
    throw new Error("O parâmetro 'time' deve ser uma string no formato 'hh:mm:ss'.");
  }

  const parts = time.split(':');

  if (parts.length < 2) {
    throw new Error("Formato inválido. Use 'hh:mm:ss'.");
  }

  const [hours, minutes] = parts;

  return `${hours}:${minutes}`;
}

export function log(name: string, obj: any) {
  if (__DEV__) {
    console.log(`${name}: `, JSON.stringify(obj, null, 2));
  }
}

export function removeAccents(input: string): string {
  return input
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove marcas diacríticas
    .replace(/[.\-]/g, '') // Remove pontos e traços
    .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um único espaço
    .trim(); // Remove espaços extras no início e no fim
}
