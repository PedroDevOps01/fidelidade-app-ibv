import { Card, Paragraph, Title, TouchableRipple, useTheme } from 'react-native-paper';
import { maskBrazilianCurrency } from '../../utils/app-utils';

interface ContractDetailCardProps {
  contract: Plano;
  onPress: () => void;
}

export default function ContractDetailCard({ contract, onPress }: ContractDetailCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableRipple  onPress={onPress} style={{ minHeight: 300, borderWidth: 0.5, borderRadius: 10, borderColor: colors.primary }}>
      <Card.Content style={{ alignItems: 'center', padding: 16 }}>
        <Title style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>{contract.des_nome_pla}</Title>
        <Paragraph style={{ textAlign: 'center', color: '#666', marginBottom: 10 }}>{contract.des_descricao_pla}</Paragraph>
        {contract.qtd_max_dependentes_pla && Number(contract.qtd_max_dependentes_pla) > 0 && (
        <Title style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>
          {`Até ${contract.qtd_max_dependentes_pla} dependente${Number(contract.qtd_max_dependentes_pla) > 1 ? 's' : ''} sem custo adicional`}
        </Title>
        )}
        <Title style={{ fontSize: 20, color: '#4CAF50', fontWeight: 'bold' }}>Valor do plano: R$ {maskBrazilianCurrency(contract.vlr_adesao_pla!)}</Title>
      </Card.Content>
    </TouchableRipple>
  );
}

