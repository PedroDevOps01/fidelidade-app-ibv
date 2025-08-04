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
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
      <ImageViewerPreview 
        type="large" 
        uri={data.fachada_empresa} 
        onLong={() => {}}
      />

      <Card.Title
        title={data.empresa}
        titleNumberOfLines={2}
        subtitle={`${data.endereco}, ${data.numero} - ${data.bairro}, ${data.cidade} - ${data.estado}`}
        titleStyle={[styles.title, { color: colors.onSurface }]}
        subtitleStyle={[styles.subtitle, { color: colors.onSurfaceVariant }]}
        subtitleNumberOfLines={2}
        style={styles.cardHeader}
      />

      <Card.Content style={styles.cardContent}>
        <Divider style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

        <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Procedimentos
        </Text>

        <FlatList
          data={data.procedimentos}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <List.Item
              title={item.nome}
              titleNumberOfLines={2}
              description={`Assinante: ${maskBrazilianCurrency(item.valor_assinatura)}\nParticular: ${maskBrazilianCurrency(item.valor_particular)}`}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={props => (
                <Avatar.Icon 
                  {...props} 
                  icon="medical-bag" 
                  style={{ backgroundColor: colors.primaryContainer }} 
                  color={colors.onPrimaryContainer} 
                  size={40}
                />
              )}
              style={styles.listItem}
            />
          )}
          scrollEnabled={false}
          removeClippedSubviews={false}
          ItemSeparatorComponent={() => <View style={[styles.listSeparator, { backgroundColor: colors.surfaceVariant }]} />}
        />

        <Button 
          mode="contained" 
          onPress={() => onPress(data)}
          style={styles.actionButton}
          labelStyle={styles.actionButtonLabel}
          contentStyle={styles.actionButtonContent}
        >
          Selecionar Local
        </Button>
      </Card.Content>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    opacity: 0.8,
  },
  sectionTitle: {
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
    opacity: 0.8,
  },
  listItem: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  listSeparator: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.08,
    marginVertical: 4,
  },
  actionButton: {
    borderRadius: 8,
    marginTop: 16,
    elevation: 0,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    paddingVertical: 2,
  },
  actionButtonContent: {
    height: 44,
  },
});

export default ExamsLocalsCard;