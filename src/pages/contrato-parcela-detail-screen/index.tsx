import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, FlatList, Animated, Dimensions, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { api } from '../../network/api';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { createRequestHeader } from '../../utils/app-utils';
import ContratoParcelaDetailsCard from './contrato-parcela-details-card';
import MaskedView from '@react-native-masked-view/masked-view';

type ContratoParcelaDetailsRouteParams = {
  params: {
    idContrato: number;
  };
};

const screenHeight = Dimensions.get('window').height;

const ContratoParcelaDetailScren = () => {
  const theme = useTheme();
  const route = useRoute<RouteProp<ContratoParcelaDetailsRouteParams, 'params'>>();
  const { authData } = useAuth();
  const idContrato = route.params.idContrato;

  const [loading, setLoading] = useState<boolean>(false);
  const [contratoParcelaDetails, setContratoParcelaDetails] = useState<ContratoParcelaDetails[]>([]);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [restartKey, setRestartKey] = useState(Date.now());

  async function fetchData() {
    setLoading(true);
    console.log(`/parcela/${idContrato}`);
    try {
      const { data } = await api(`/parcela/${idContrato}`, {
        headers: createRequestHeader(authData.access_token),
      });
      setContratoParcelaDetails(data.data.data);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  useEffect(() => {
    if (loading) {
      // Reset animations when loading starts
      fadeAnim.setValue(0);
      fillAnim.setValue(0);
      setImageLoaded(false);
      setRestartKey(Date.now());
    }
  }, [loading]);

  useEffect(() => {
    if (imageLoaded && loading) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Water fill animation loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(fillAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(fillAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [imageLoaded, loading]);

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  return (
    <View style={[styles.outerContainer, { backgroundColor: '#c1d3f0' }]}>
      {loading ? (
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          {!imageLoaded && (
            <View style={[styles.placeholder, { width: 400, height: 400 }]} />
          )}
          <MaskedView
            key={restartKey}
            style={{ width: 400, height: 400, position: 'absolute' }}
            maskElement={
              <Image
                source={require('../../assets/images/iconecarregamento.png')}
                style={{ width: 400, height: 400 }}
                resizeMode="cover"
                onLoad={() => {
                  setImageLoaded(true);
                }}
              />
            }
          >
            <View style={styles.background} />
            <Animated.View style={[styles.fill, { height: fillHeight, width: 400 }]} />
          </MaskedView>
        </Animated.View>
      ) : (
        <FlatList
          data={contratoParcelaDetails}
          keyExtractor={item => item.cod_numparcela_cpc.toString()}
          renderItem={({ item }) => (
            <ContratoParcelaDetailsCard item={item} key={item.id_contrato_parcela_config_cpc} />
          )}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: '#d3c1e0',
    borderRadius: 200,
  },
  background: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#644086',
  },
});

export default ContratoParcelaDetailScren;