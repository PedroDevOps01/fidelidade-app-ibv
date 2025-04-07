type LoginResponse = {
  user: User;
  authorization: AuthorizationData;
  dados?: PessoaDados;
  assinatura?: PessoaAssinatura;
  errorCadastroPagarme: ErrorCadastroPagarme | null
  mdv: PessoaMdv[]
};