export const Masks = {
  BRL_PHONE: '(00) [00000] [0000]'
}


export function maskBrazilianCurrency(value: string | number): string {
  // Converte o valor para string e remove todos os caracteres que não sejam números
  let numericValue = value.toString().replace(/\D/g, "");

  // Adiciona as casas decimais
  numericValue = numericValue.replace(/(\d{2})$/, ",$1");

  // Adiciona os pontos de milhares
  numericValue = numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

  // Retorna o valor formatado com o símbolo R$
  return numericValue;
}