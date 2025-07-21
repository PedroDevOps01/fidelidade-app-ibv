import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Text, useTheme, Card, Button, IconButton } from 'react-native-paper';
import { Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../network/api';
import { generateRequestHeader } from '../../utils/app-utils';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface Parceiro {
  id_parceiro_prc: number;
  des_nome_fantasia_prc: string;
  des_razao_social_prc: string;
  des_endereco_prc: string;
  des_complemento_prc: string;
  des_bairro_prc: string;
  des_municipio_mun: string;
  des_email_responsavel_prc: string;
  des_nome_responsavel_prc: string;
  des_endereco_web_prc: string;
  cod_documento_prc: string;
  num_celular_prc: string;
  num_telefone_prc: string;
  img_parceiro_prc: string | null;
  is_ativo_prc: number;
  is_parceiro_padrao_prc: number;
  dth_cadastro_prc: string;
  dth_alteracao_prc: string;
  id_municipio_prc: number;
}

const PartnersScreen = ({ navigation }: { navigation: any }) => {
  const { colors } = useTheme();
  const { authData } = useAuth();
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Map API data to partnerData structure
  const partnerData = parceiros.map(parceiro => ({
    name: parceiro.des_nome_fantasia_prc,
    image: parceiro.img_parceiro_prc
      ? { uri: `${parceiro.img_parceiro_prc}` }
      : require('../../assets/images/logonova.png'),
    // Fallback for discount and category (adjust based on API data or backend updates)
    discount: 'Desconto Exclusivo', // Placeholder, as API doesn't provide discount
    category: parceiro.des_municipio_mun || 'Parceiro', // Use municipality or a default
  }));


  useFocusEffect(
  useCallback(() => {
    fetchParceiros(); // Always fetch partners when view is focused
  }, []),
);
  const handlePartnerPress = (partner: any) => {
    console.log('Parceiro selecionado:', partner.name);
    // Add navigation or modal logic if needed, similar to LoggedHome
  };

  async function fetchParceiros(): Promise<void> {
    try {
      setLoading(true);
      const response = await api.get('/parceiro/app', generateRequestHeader(authData.access_token));
      const dataApi = response.data;

      if (dataApi && dataApi.response && dataApi.response.data && dataApi.response.data.length > 0) {
        console.log('Parceiros encontrados:', dataApi.response.data);
        setParceiros(dataApi.response.data);
      } else {
        setError('Nenhum parceiro encontrado');
        console.log('Nenhum parceiro encontrado');
      }
    } catch (error: any) {
      setError('Erro ao buscar parceiros: ' + error.message);
      console.error('Erro ao buscar parceiros:', error.message, error.response?.data);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (authData.access_token) {
        fetchParceiros();
      }
    }, [authData]),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e7d7ff' }}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Descontos exclusivos para você</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.container}>
          {loading ? (
            <Text style={{ textAlign: 'center', color: colors.onSurface, marginVertical: 20 }}>
              Carregando parceiros...
            </Text>
          ) : error ? (
            <Text style={{ textAlign: 'center', color: 'red', marginVertical: 20 }}>
              {error}
            </Text>
          ) : partnerData.length === 0 ? (
            <Text style={{ textAlign: 'center', color: colors.onSurfaceVariant, marginVertical: 20 }}>
              Nenhum parceiro disponível no momento
            </Text>
          ) : (
            partnerData.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePartnerPress(item)}
                activeOpacity={0.9}
              >
                <Card style={styles.card}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <Text style={styles.partnerCategory}>{item.category}</Text>
                      <View style={styles.discountBadge}>
                        <Icon name="tag" size={14} color="#fff" />
                        <Text style={styles.discountText}>{item.discount}</Text>
                      </View>
                    </View>

                    <Image
                      source={item.image}
                      style={[styles.partnerImage, { borderRadius: 15 }]}
                    />

                    <Text style={styles.partnerName}>{item.name}</Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Footer (uncomment if needed) */}
        {/* <View style={styles.footer}>
          <Text style={styles.footerText}>Quer ser nosso parceiro?</Text>
          <Button
            mode="outlined"
            style={styles.becomePartnerButton}
            labelStyle={styles.becomePartnerLabel}
          >
            Fale Conosco
          </Button>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a148c',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    elevation: 4,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  partnerCategory: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6a1b9a',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  partnerImage: {
    width: '50%',
    height: 160,
    marginVertical: 10,
    alignSelf: 'center',
  },
  partnerName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
    color: '#333',
  },
  partnerButton: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#7b1fa2',
    paddingVertical: 3,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  footerText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  becomePartnerButton: {
    borderColor: '#7b1fa2',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  becomePartnerLabel: {
    color: '#7b1fa2',
    fontWeight: 'bold',
  },
});

export default PartnersScreen;