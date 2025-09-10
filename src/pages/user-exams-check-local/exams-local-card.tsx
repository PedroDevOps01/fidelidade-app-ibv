import React, { useState } from 'react';
import { View, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { Card, Text, useTheme, Divider, List, Avatar, Button } from 'react-native-paper';
import { maskBrazilianCurrency } from '../../utils/app-utils';
import ImageViewerPreview from '../parceiro-produto-create/image-viewer-preview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { api } from '../../network/api';
import { generateRequestHeader } from '../../utils/app-utils';

interface ExamsLocalsCardProps {
  data: ExamsLocals;
  onPress: (item: ExamsLocals) => void;
}

const { width } = Dimensions.get('window');

const ExamsLocalsCard: React.FC<ExamsLocalsCardProps> = ({ data, onPress }) => {
  const { colors } = useTheme();
  const [visible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controlar o carregamento
  const { authData } = useAuth();
  const { dadosUsuarioData } = useDadosUsuario();
  const cod_paciente = dadosUsuarioData?.pessoa?.id_pessoa_usr;
  
  async function fetchPaciente(codParceiro: number, codPaciente: number) {
    try {
      const url = `integracao/setPaciente?cod_parceiro=${Number(codParceiro)}&cod_paciente=${Number(codPaciente)}`;
      console.log('Request URL:', url);

      const response = await api.get(url, generateRequestHeader(authData.access_token));

      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.status === 200) {
        return response.data;
      } else {
        console.log('Aviso', 'Não foi possível carregar os dados do paciente.');
        return null;
      }
    } catch (err: any) {
      console.error('Error:', err);
      console.log('Aviso', 'Erro ao buscar paciente. Tente novamente');
      return null;
    }
  }

  return (
    <View style={{ marginHorizontal: 16, marginTop: 12 }}>
      {/* Barra de progresso FORA do Card */}
     

      <Card style={styles.card}>
        <View style={styles.cardContainer}>
          <ImageViewerPreview type="large" uri={data.fachada_empresa} onLong={() => {}} style={styles.cardImage} />

          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={[styles.title, { color: colors.onSurface }]}>
              {data.empresa}
            </Text>

            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={18} color={colors.primary} style={styles.locationIcon} />
              <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                {`${data.endereco}, ${data.numero} - ${data.bairro}, ${data.cidade} - ${data.estado}`}
              </Text>
            </View>

            <Divider style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

            <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Procedimentos Disponíveis
            </Text>

            <FlatList
              data={data.procedimentos}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <List.Item
                  title={item.des_grupo_tpr || 'Procedimento sem grupo'}
                  titleNumberOfLines={2}
                  titleStyle={[styles.procedureTitle, { color: colors.onSurface }]}
                  description={`Assinante: ${maskBrazilianCurrency(item.valor_assinatura)}\nParticular: ${maskBrazilianCurrency(item.valor_particular)}`}
                  descriptionStyle={[styles.procedureDescription, { color: colors.onSurfaceVariant }]}
                  left={props => (
                    <Avatar.Icon
                      {...props}
                      icon="medical-bag"
                      style={{
                        backgroundColor: colors.primaryContainer,
                        marginRight: 8,
                      }}
                      color={colors.onPrimaryContainer}
                      size={44}
                    />
                  )}
                  style={styles.listItem}
                />
              )}
              scrollEnabled={false}
              removeClippedSubviews={false}
              ItemSeparatorComponent={() => <Divider style={[styles.listSeparator, { backgroundColor: colors.surfaceVariant }]} />}
            />

            <Button
              mode="contained"
              loading={loading} // Exibe o spinner durante o carregamento
              disabled={loading} // Desabilita o botão enquanto carrega
              onPress={async () => {
                try {
                  if (!data?.cod_parceiro || !cod_paciente) {
                    console.log('cod_parceiro ou cod_paciente não encontrado');
                    return;
                  }

                  setLoading(true); // Ativa o spinner
                  console.log('cod_parceiro:', data.cod_parceiro);
                  console.log('cod_paciente:', cod_paciente);

                  const paciente = await fetchPaciente(data.cod_parceiro, cod_paciente);

                  if (paciente) {
                    console.log('Retorno do backend:', paciente);
                    onPress(data); // Chama o handler original com os dados já setados
                  } else {
                    console.log('Nenhum paciente retornado do backend.');
                  }
                } catch (err) {
                  console.log('Erro ao buscar paciente:', err);
                } finally {
                  setLoading(false); // Desativa o spinner
                }
              }}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              labelStyle={styles.actionButtonLabel}
              contentStyle={styles.actionButtonContent}
              icon="check-circle">
              Selecionar Local
            </Button>
          </Card.Content>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContainer: {
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0.15,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    opacity: 0.9,
    flexShrink: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 8,
  },
  infoText: {
    lineHeight: 20,
    letterSpacing: 0.25,
    marginLeft: 6,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  listItem: {
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  listSeparator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoTextContainer: {
    flex: 1,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduleIcon: {
    marginRight: 8,
  },
  procedureTitle: {
    fontWeight: '500',
    fontSize: 15,
  },
  procedureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButton: {
    borderRadius: 12,
    marginTop: 16,
    shadowColor: 'transparent',
  },
  actionButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.25,
    paddingVertical: 1,
  },
  actionButtonContent: {
    height: 48,
  },
});

export default ExamsLocalsCard;