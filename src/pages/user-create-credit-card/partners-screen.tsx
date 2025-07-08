import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, Card, Title, Button } from 'react-native-paper';
import { Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScrollView } from 'react-native'; // Adicione essa importação

const { width } = Dimensions.get('window');

const PartnersScreen = ({ navigation }: { navigation: any }) => {
  const { colors } = useTheme();

  const partnerData = [
    {
      name: 'Pague Menos',
      image: require('../../assets/images/paguemenos.jpeg'),
      discount: 'Até 30% OFF',
      category: 'Farmácia',
    },
    // {
    //   name: 'Magalu',
    //   image: require('../../assets/images/magalu.jpeg'),
    //   discount: 'Frete Grátis',
    //   category: 'E-commerce',
    // },
    // {
    //   name: 'Espaçolaser Depilação',
    //   image: require('../../assets/images/depi.jpeg'),
    //   discount: '1ª Sessão Grátis',
    //   category: 'Beleza',
    // },
  ];

  const handlePartnerPress = (partner: any) => {
    // Navegação para detalhes do parceiro ou ação comercial
    console.log('Parceiro selecionado:', partner.name);
  };

  return (
    
      <SafeAreaView style={{ flex: 1,backgroundColor: '#e7d7ff'}}>
  <View style={styles.header}>
    <Text style={styles.headerSubtitle}>Descontos exclusivos para você</Text>
  </View>

  {/* ENVOLVE AQUI COM SCROLLVIEW */}
  <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
    <View style={styles.container}>
      {partnerData.map((item, index) => (
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
      ))}
    </View>

    {/* Deixe o footer DENTRO do ScrollView também, se quiser que role junto */}
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