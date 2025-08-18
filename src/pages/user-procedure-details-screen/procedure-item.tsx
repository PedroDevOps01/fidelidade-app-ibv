import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Card, Text, useTheme, Divider, Button, List, Avatar } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { maskBrazilianCurrency, generateRequestHeader } from '../../utils/app-utils';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { api } from '../../network/api';
import { useAuth } from '../../context/AuthContext';


export default function ProcedureItem({ procedure, navigation, isFirst, isLast }) {
  const { colors } = useTheme();
    const { authData } = useAuth();
  
  const { dadosUsuarioData } = useDadosUsuario(); // puxando os dados do usuário
  // Exemplo: pegar o nome do usuário

  const cod_paciente = dadosUsuarioData?.pessoa?.id_pessoa_usr;
  
  async function fetchPaciente(codParceiro: number, codPaciente: number) {
  console.log('Fetching paciente for:', { codParceiro, codPaciente });

  try {
    const url = `integracao/setPaciente?cod_parceiro=${Number(codParceiro)}&cod_paciente=${Number(codPaciente)}`;
    console.log('Request URL:', url);

    const response = await api.get(url, generateRequestHeader(authData.access_token));

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    if (response.status === 200) {
      return response.data; // pode setar em um state se preferir
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
    <View style={{ marginHorizontal: 16, marginTop: isFirst ? 0 : 5, marginBottom: isLast ? 16 : 12 }}>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardContainer}>
          {procedure.fachada_empresa && <Image source={{ uri: procedure.fachada_empresa }} style={styles.cardImage} />}
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={[styles.title, { color: colors.onSurface }]}>
              {procedure.empresa}
            </Text>

            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={18} color={colors.primary} style={styles.locationIcon} />
              <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                {`${procedure.endereco}, ${procedure.numero} - ${procedure.bairro}, ${procedure.cidade} - ${procedure.estado}`}
              </Text>
            </View>

            <Divider style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface, marginTop: 16 }]}>
              Procedimentos Disponíveis
            </Text>

            <List.Item
              title={procedure.nome}
              titleNumberOfLines={2}
              titleStyle={[styles.procedureTitle, { color: colors.onSurface }]}
              description={`Assinante: ${maskBrazilianCurrency(procedure.valor_assinatura)}\nParticular: ${maskBrazilianCurrency(procedure.valor_particular)}`}
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

<Button
  mode="contained"
  onPress={async () => {
    try {
      if (!procedure?.cod_parceiro || !cod_paciente) {
        console.log('cod_parceiro ou cod_paciente não encontrado');
        return;
      }
      
      console.log('cod_parceiro:', procedure.cod_parceiro);
      console.log('cod_paciente:', cod_paciente);
      
      // Chamada correta da função fetchPaciente
      const paciente = await fetchPaciente(procedure.cod_parceiro, cod_paciente);

      if (paciente) {
        console.log('Retorno do backend:', paciente);
        
        // Ação de navegação
        navigation.navigate('user-procedure-time', { procedimento: procedure });

      } else {
        console.log('Nenhum paciente retornado do backend.');
      }
    } catch (err) {
      console.log('Erro ao buscar paciente:', err);
    }
  }}
  style={[styles.actionButton, { backgroundColor: colors.primary }]}
  labelStyle={styles.actionButtonLabel}
  contentStyle={styles.actionButtonContent}
  icon="check-circle"
>
  Selecionar Local
</Button>

          </Card.Content>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContainer: {
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0.15,
    marginBottom: 12,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
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
  procedureTitle: {
    fontWeight: '500',
    fontSize: 15,
  },
  procedureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  listItem: {
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
});
