import { Image, Platform, StyleSheet, Dimensions, View, TouchableOpacity } from 'react-native';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useLayoutEffect, useState } from 'react';
import { formatDateToDDMMYYYY, log } from '../../utils/app-utils';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const UserPersonalCarteirinhaScreen = ({ navigation }: { navigation: any }) => {
  const { dadosUsuarioData } = useDadosUsuario();
  const { colors } = useTheme();
  const [isZoomed, setIsZoomed] = useState(false);

  useLayoutEffect(() => {
    log('data', dadosUsuarioData.pessoaDados);
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0.3,
          borderTopColor: colors.onSurfaceVariant,
          height: Platform.OS == 'android' ? 60 : 90,
          elevation: 0,
        },
      });
    };
  }, [navigation]);

  const toggleZoom = () => setIsZoomed(!isZoomed);

  const cardWidth = isZoomed ? windowHeight * 0.8 : windowWidth * 0.9;
  const cardHeight = isZoomed ? windowHeight * 0.4 : windowWidth * 0.6;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, isZoomed && styles.hidden]}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.onBackground}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Carteirinha</Text>
      </View>

      {/* Wrapper que rotaciona a carteirinha somente no zoom */}
      <View style={[styles.landscapeWrapper, isZoomed && styles.landscapeRotate]}>
        <View
          style={[
            styles.cardContainer,
            { 
              width: cardWidth,
              height: cardHeight,
              backgroundColor: '#b183ff',
              borderColor: '#b183ff',
              borderWidth: 2,
            },
            isZoomed && styles.zoomedCard,
          ]}
        >
          {/* Efeito de gradiente */}
          <View style={styles.gradientOverlay} />
          
          {/* Logo e informações */}
          <View style={styles.cardHeader}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/app_icon1.png')}
                style={[styles.cardLogo, isZoomed && styles.zoomedLogo]}
                resizeMode="contain"
              />
              <Text style={styles.appName}>AJUDDA</Text>
            </View>

            <View style={styles.memberInfo}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, isZoomed && styles.zoomedText]}>Nome:</Text>
                <Text style={[styles.infoValue, isZoomed && styles.zoomedText]}>
                  {formatarNome(dadosUsuarioData.pessoaDados?.des_nome_pes)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, isZoomed && styles.zoomedText]}>CPF:</Text>
                <Text style={[styles.infoValue, isZoomed && styles.zoomedText]}>
                  {dadosUsuarioData.pessoaDados?.cod_cpf_pes}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, isZoomed && styles.zoomedText]}>Nascimento:</Text>
                <Text style={[styles.infoValue, isZoomed && styles.zoomedText]}>
                  {formatDateToDDMMYYYY(dadosUsuarioData.pessoaDados?.dta_nascimento_pes ?? '')}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, isZoomed && styles.zoomedText]}>Tipo:</Text>
                <Text style={[styles.infoValue, isZoomed && styles.zoomedText]}>
                  {dadosUsuarioData.pessoaDados?.des_descricao_tsi?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={[styles.cardFooter, isZoomed && styles.zoomedFooter]}>
            <Text style={[styles.matriculaId, isZoomed && styles.zoomedText]}>
              Matrícula: {dadosUsuarioData.pessoaDados?.id_pessoa_pda}
            </Text>
            <View style={styles.barcodeContainer}>
              <View style={styles.barcodeLines} />
              <View style={styles.barcodeLines} />
              <View style={styles.barcodeLines} />
              <View style={styles.barcodeLines} />
              <View style={styles.barcodeLines} />
              <View style={styles.barcodeLines} />
              <View style={styles.barcodeLines} />
              <View style={styles.barcodeLines} />
            </View>
          </View>
          
          {/* Elementos decorativos */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
        </View>
      </View>

      {/* Botão de zoom carteirinha */}
      <View style={styles.expandButtonContainer}>
        <TouchableOpacity 
          style={[styles.expandButton, { backgroundColor: colors.primary }]} 
          onPress={toggleZoom}
        >
          <Text style={[styles.expandirtext, { color: colors.onPrimary }]}>
            {isZoomed ? 'Reduzir' : 'Expandir'}
          </Text>
          <IconButton 
            icon={isZoomed ? "magnify-minus" : "magnify-plus"} 
            size={24} 
            iconColor={colors.onPrimary} 
          />
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
  additionalInfoContainer: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    height: 60,
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
  },
  landscapeWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  landscapeRotate: {
    transform: [{ rotate: '90deg' }],
  },
  cardContainer: {
    overflow: 'hidden',
    elevation: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    flexDirection: 'column',
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  zoomedCard: {
    elevation: 12,
  },
  cardHeader: {
    padding: 20,
    flex: 1,
    flexDirection: 'row',
  },
  logoContainer: {
    alignItems: 'center',
    marginRight: 20,
    justifyContent: 'center',
  },
  cardLogo: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginBottom: 8,
  },
  zoomedLogo: {
    width: 90,
    height: 90,
  },
  appName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#e0d6ed',
    fontSize: 14,
    fontWeight: '600',
    width: 90,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  zoomedText: {
    fontSize: 20,
  },
  expandirtext: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  expandButtonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  expandButton: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  cardFooter: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  zoomedFooter: {
    padding: 15,
  },
  matriculaId: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  barcodeLines: {
    width: 4,
    height: 30,
    backgroundColor: '#fff',
    marginHorizontal: 2,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: 30,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  additionalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  additionalText: {
    fontSize: 16,
    marginBottom: 4,
  },
});

const formatarNome = (nomeCompleto?: string): string => {
  if (!nomeCompleto) return '';

  const partes = nomeCompleto.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0].toUpperCase();
  }

  const primeiro = partes[0];
  const ultimo = partes[partes.length - 1];

  return `${primeiro} ${ultimo}`.toUpperCase();
};

export default UserPersonalCarteirinhaScreen;