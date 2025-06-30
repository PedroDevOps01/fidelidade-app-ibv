import { Image, Platform, StyleSheet, Dimensions } from 'react-native'; // Removed ImageBackground
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { View } from 'react-native';
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

  return (
<View style={[styles.mainContainer, { backgroundColor: '#FEF7FF' }]}>
      {/* Header branco com título */}
      <View style={[styles.header, isZoomed && styles.hidden]}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#000"
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Carteirinha</Text>
      </View>

      {/* Wrapper que rotaciona a carteirinha somente no zoom */}
      <View style={[styles.landscapeWrapper, isZoomed && styles.landscapeRotate]}>
        <View
          style={[
            styles.cardContainer,
            { width: cardWidth },
            isZoomed && styles.zoomedCard,
          ]}
        >
          <View style={styles.cardHeader}>
            <Image
              source={require('../../assets/images/app_icon1.png')}
              style={[styles.cardLogo, isZoomed && styles.zoomedLogo]}
              resizeMode="contain"
            />

            <View style={styles.memberInfo}>
              <Text style={[styles.memberType, isZoomed && styles.zoomedText]}>
                {formatarNome(dadosUsuarioData.pessoaDados?.des_nome_pes)} - {dadosUsuarioData.pessoaDados?.des_descricao_tsi?.toUpperCase()}
              </Text>
              
            
          <Text style={[styles.memberId, isZoomed && styles.zoomedText]}>
            CPF: {dadosUsuarioData.pessoaDados?.cod_cpf_pes}
          </Text>
          <Text style={[styles.memberId, isZoomed && styles.zoomedText]}>
            Nascimento: {formatDateToDDMMYYYY(dadosUsuarioData.pessoaDados?.dta_nascimento_pes ?? '')}
          </Text>
          
          
          <Text style={[styles.memberId, isZoomed && styles.zoomedText]}>
            Endereço: {`${dadosUsuarioData.pessoaDados?.des_endereco_pda ?? ''}, ${dadosUsuarioData.pessoaDados?.des_bairro_pda ?? ''}, ${dadosUsuarioData.pessoaDados?.des_municipio_mun ?? ''} - ${dadosUsuarioData.pessoaDados?.des_estado_est ?? ''}`}
          </Text>
            
              
            </View>
          </View>

          {/* Footer branco */}
          <View style={[styles.cardFooter, isZoomed && styles.zoomedFooter]}>
            <Text style={[styles.matriculaId, isZoomed && styles.zoomedText]}>
                Matrícula: {dadosUsuarioData.pessoaDados?.id_pessoa_pda}
              </Text>
          </View>
        </View>
      </View>

      {/* Botão de zoom carteirinha */}
      {!isZoomed && (
        <View style={styles.expandButtonContainer}>
          <View style={styles.expandButton}>
            <Text style={styles.expandirtext} onPress={toggleZoom}>Expandir</Text>
            <IconButton icon="magnify-plus" size={24} iconColor="#fff" onPress={toggleZoom} />
          </View>
        </View>
      )}
      {isZoomed && (
        <View style={styles.expandButtonContainer}>
          <View style={styles.expandButton}>
            <Text style={styles.expandirtext} onPress={toggleZoom}>Reduzir</Text>
            <IconButton icon="magnify-minus" size={24} iconColor="#fff" onPress={toggleZoom} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  additionalInfoContainer: {
    backgroundColor: '#FEF7FF',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    elevation: 2,
    marginTop: 0,
   
  },
  header: {
    backgroundColor: '#FEF7FF',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    elevation: 2,
    
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
    color: '#000',
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
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 4,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'column',
  },
  zoomedCard: {
    
  },
  cardHeader: {
    padding: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogo: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderRadius: 8,
  },
  zoomedLogo: {
    width: 80,
    height: 80,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#b183ff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberId: {
    color: '#b183ff',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 4,
  },
  matriculaId: {
    color: '#fff',
    fontSize: 22,
    opacity: 0.8,
    fontWeight: 600,
    marginBottom: 4,
  },
  memberType: {
    color: '#b183ff',
    fontSize: 16,
    fontWeight: 600,
  },
  zoomedText: {
    fontSize: 22,
  },
  expandirtext: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  expandButtonContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  expandButton: {
    backgroundColor: '#b183ff',
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    backgroundColor: '#b183ff',
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedFooter: {
    padding: 15,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomedFooterText: {
    fontSize: 18,
  },
});
const formatarNome = (nomeCompleto?: string): string => {
  if (!nomeCompleto) return '';

  const partes = nomeCompleto.trim().split(/\s+/);

  if (partes.length === 1) {
    return partes[0].toUpperCase(); // Apenas um nome
  }

  const primeiro = partes[0];
  const ultimo = partes[partes.length - 1];

  return `${primeiro} ${ultimo}`.toUpperCase();
};
export default UserPersonalCarteirinhaScreen;