import React, { useState } from 'react';
import { View, StyleSheet, Image, FlatList } from 'react-native';
import { Card, Text, useTheme, Divider, List, Avatar, Button } from 'react-native-paper';
import { maskBrazilianCurrency } from '../../utils/app-utils';
import ImageViewing from 'react-native-image-viewing';
import ImageViewerPreview from '../parceiro-produto-create/image-viewer-preview';

interface ExamsLocalsCardProps {
  data: ExamsLocals;
  onPress: (item: ExamsLocals) => void;
}

const ExamsLocalsCard: React.FC<ExamsLocalsCardProps> = ({ data, onPress }) => {
  const { colors } = useTheme();

  const [visible, setIsVisible] = useState(false);

  return (
    <View style={styles.card}>
      <ImageViewerPreview type="large" uri={data.fachada_empresa} onLong={() => {}} />

      <Card.Title
        title={data.empresa}
        subtitle={`${data.endereco}, ${data.numero} - ${data.bairro}, ${data.cidade} - ${data.estado}`}
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
        subtitleNumberOfLines={2}
      />

      <Card.Content>
        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Procedimentos</Text>

        <FlatList
          data={data.procedimentos}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <List.Item
              title={item.nome}
              description={`Assinatura: R$ ${maskBrazilianCurrency(item.valor_assinatura)}\nParticular: R$ ${maskBrazilianCurrency(item.valor_particular)}`}
              left={props => <Avatar.Icon {...props} icon="medical-bag" style={{ backgroundColor: colors.primary }} color={colors.onPrimary} />}
            />
          )}
          removeClippedSubviews={false}
        />

        <Button mode="contained" key={'continue'} onPress={() => onPress(data)}>
          Continuar
        </Button>
      </Card.Content>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    padding: 10,
    elevation: 0,
  },
  image: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 8,
  },
});

export default ExamsLocalsCard;
