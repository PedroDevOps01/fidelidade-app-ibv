import React from 'react';
import { FlatList, StyleSheet, Animated, View, Easing, Text } from 'react-native';
import { Avatar, Card, Divider, useTheme } from 'react-native-paper';
import LoadingFull from '../../components/loading-full';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ProfissionalCardProps {
  profissional: ProfessionallMedico;
  navigation: any;
  colors: any;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

function ProfissionalCard({ profissional, navigation, colors, fadeAnim, slideAnim }: ProfissionalCardProps) {
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card
        style={[
          styles.card,
          { backgroundColor: colors.surface || '#fff', marginHorizontal: 8, marginTop: 8 },
        ]}
        onPress={() => {
          navigation.navigate('user-procedures-by-medico', {
            professional: profissional,
          });
        }}
      >
        <Card.Title
          title={profissional.nome_profissional}
          titleStyle={[styles.title, { color: colors.onSurface || '#000' }]}
          subtitle={
            profissional.conselho_profissional
              ? `CRM: ${profissional.conselho_profissional}`
              : 'CRM não informado'
          }
          subtitleStyle={[styles.subtitle, { color: colors.onSurfaceVariant || '#666' }]}
          left={() => (
            <Avatar.Image
              size={50}
              source={{ uri: profissional.fachada_profissional || 'https://via.placeholder.com/50' }}
              style={[styles.avatar, { backgroundColor: colors.background || '#f0f0f0' }]}
            />
          )}
          right={() => (
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={colors.onSurfaceVariant || '#666'}
              style={styles.rightIcon}
            />
          )}
        />
      </Card>
    </Animated.View>
  );
}

export default function ProfissionalList({
  navigation,
  data,
  loading,
}: {
  navigation: any;
  data: ProfessionallMedico[];
  loading: boolean;
}) {
  const { colors } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return loading ? (
    <LoadingFull />
  ) : (
    <FlatList
      data={data || []}
      keyExtractor={(item, index) => item.id?.toString() || `prof-${index}`}
      renderItem={({ item }) => (
        <ProfissionalCard
          profissional={item}
          navigation={navigation}
          colors={colors}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
        />
      )}
      style={[styles.list, { backgroundColor: colors.background || '#fff', paddingHorizontal: 8 }]}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: 24 }]}
      removeClippedSubviews={false}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => (
        <Divider style={[styles.divider, { backgroundColor: colors.outlineVariant || '#ccc' }]} />
      )}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.onSurface || '#000' }}>Nenhum profissional disponível</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  rightIcon: {
    alignSelf: 'center',
    marginRight: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 4,
    opacity: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
