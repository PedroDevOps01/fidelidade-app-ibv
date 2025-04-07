type ContratosStackParamList = {
  Contratos: undefined;
  'contrato-details': { data: ContratoResponse }; // Adicione os parâmetros, se houver
  'new-contrato-screen': undefined;
};


type ContratosNavigationProp = NativeStackNavigationProp<ContratosStackParamList>;