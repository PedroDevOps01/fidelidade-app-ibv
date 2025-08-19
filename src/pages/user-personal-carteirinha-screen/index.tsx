import { Image, Platform, StyleSheet, Dimensions, View, TouchableOpacity } from 'react-native';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useLayoutEffect, useState } from 'react';
import { formatDateToDDMMYYYY, log } from '../../utils/app-utils';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const UserPersonalCarteirinhaScreen = ({ navigation }: { navigation: any }) => {
  const { dadosUsuarioData } = useDadosUsuario();
  console.log('Dados do usuário:', dadosUsuarioData);
  const { colors } = useTheme();
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleZoom = () => setIsZoomed(!isZoomed);

  const cardWidth = isZoomed ? windowHeight * 0.6 : windowWidth * 0.9;
  const cardHeight = isZoomed ? windowHeight * 0.4 : windowWidth * 0.6;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Header */}
      

      {/* Wrapper que rotaciona a carteirinha somente no zoom */}
      <View style={[
        styles.landscapeWrapper,
        isZoomed && styles.landscapeRotate,
      
      ]}>
        <View
          style={[
            styles.cardContainer,
            {
              width: cardWidth,
              height: cardHeight,
              backgroundColor: '#FFFFFF',
              borderColor: '#644086',
              borderWidth: 2,
            },
            isZoomed && styles.zoomedCard,
          ]}>
          
          {/* Logo (mantida na posição atual) */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logonova1.png')} 
              style={[styles.cardLogo, isZoomed && styles.zoomedLogo]} 
              resizeMode="contain" 
            />
          </View>

          {/* Efeito de chip (como em cartões de crédito) */}
          <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <View style={styles.chipLines} />
            </View>
          </View>

          {/* Informações do membro */}
          <View style={styles.memberInfoContainer}>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>NOME COMPLETO</Text>
              <Text style={[styles.infoValue, isZoomed && styles.zoomedText]}>
                {formatarNome(dadosUsuarioData.pessoaDados?.des_nome_pes)}
              </Text>
            </View>

            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>CPF</Text>
              <Text style={[styles.infoValue, isZoomed && styles.zoomedText]}>
                {formatarCPF(dadosUsuarioData.pessoaDados?.cod_cpf_pes)}
              </Text>
            </View>
          </View>

          {/* Rodapé (como em cartões de crédito) */}
          <View style={[styles.cardFooter, isZoomed && styles.zoomedFooter]}>
            <Text style={[styles.footerText, isZoomed && styles.zoomedFooterText]}>
              Matrícula: {dadosUsuarioData.pessoaDados?.id_pessoa_pes}
            </Text>
          </View>

          {/* Elementos decorativos sutis */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>
      </View>

      {/* Botão de zoom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.zoomButton, { backgroundColor: '#644086' }]} 
          onPress={toggleZoom}
          activeOpacity={0.8}
        >
          <Text style={styles.zoomButtonText}>
            {isZoomed ? 'Reduzir' : 'Ampliar'} Carteirinha
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  header: {
    height: Platform.OS === 'android' ? 80 : 80, // aplica 130 apenas no Android
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  hidden: {
    display: 'none',
  },
  backButton: {
    position: 'absolute',
    left: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  landscapeWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  landscapeRotate: {
    transform: [{ rotate: '-90deg' }],
  },
  cardContainer: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    position: 'relative',
  },
  zoomedCard: {
    elevation: 12,
  },
  logoContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 2,
  },
  cardLogo: {
    width: 90,
    height:90,
  },
  zoomedLogo: {
    width: 190,
    height: 190,
  },
  chipContainer: {
    position: 'absolute',
    top: 25,
    left: 30,
  },
  chip: {
    width: 50,
    height: 40,
    backgroundColor: '#d4af37',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipLines: {
    width: 40,
    height: 30,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#b38c25',
    borderRadius: 4,
  },
  memberInfoContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 100,
    justifyContent: 'center',
  },
  infoField: {
    marginBottom: 20,
  },
  infoLabel: {
    color: '#644086',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.8,
  },
  infoValue: {
    color: '#644086',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  zoomedText: {
    fontSize: 20,
  },
  cardFooter: {
    backgroundColor: '#644086',
    padding: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  zoomedFooter: {
    padding: 18,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomedFooterText: {
    fontSize: 18,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(177, 131, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(177, 131, 255, 0.05)',
  },
  buttonContainer: {
    padding: 20,
    alignItems: 'center',
  },
  zoomButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  zoomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

// Funções auxiliares mantidas iguais
const formatarNome = (nomeCompleto?: string): string => {
  if (!nomeCompleto) return '';
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].toUpperCase();
  const primeiro = partes[0];
  const segundo = partes.length > 1 ? partes[1] : '';
  const ultimo = partes[partes.length - 1];
  return `${primeiro} ${segundo} ${ultimo}`.toUpperCase();
};

const formatarCPF = (cpf?: string | number): string => {
  if (!cpf) return '';
  const apenasNumeros = cpf.toString().replace(/\D/g, '').padStart(11, '0');
  return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export default UserPersonalCarteirinhaScreen;