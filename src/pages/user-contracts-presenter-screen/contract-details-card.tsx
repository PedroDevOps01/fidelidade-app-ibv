import { Card, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { maskBrazilianCurrency } from '../../utils/app-utils';

interface ContractDetailCardProps {
  contract: Plano;
  onPress: () => void;
}

export default function ContractDetailCard({ contract, onPress }: ContractDetailCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableRipple onPress={onPress} style={{ height: 'auto', borderWidth: 0.5, borderRadius: 10, borderColor: colors.primary }}>
      <Card.Content style={{ alignItems: 'center', padding: 16 }}>
        <Text variant="titleLarge" style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>
          {contract.des_nome_pla}
        </Text>

        <Text variant="titleMedium" style={{ textAlign: 'center', color: '#666', marginBottom: 10 }}>
          {contract.des_descricao_pla}
        </Text>

        {Number(contract.qtd_max_dependentes_pla) > 0 && (
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>
            {`Até ${Number(contract.qtd_max_dependentes_pla)} dependente${Number(contract.qtd_max_dependentes_pla) > 1 ? 's' : ''} sem custo adicional`}
          </Text>
        )}

        <Text style={{ fontSize: 20, color: '#4CAF50', fontWeight: 'bold' }}>Valor do plano: R$ {maskBrazilianCurrency(contract.vlr_adesao_pla!)}</Text>
      </Card.Content>
    </TouchableRipple>
  );
}
