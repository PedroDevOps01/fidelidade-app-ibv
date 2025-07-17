import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const LoadingFull = ({ title = "Carregando..." }: { title?: string }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: '#e7d7ff' }]}>
      <ActivityIndicator size={60} color={colors.primary} />
      <Text style={styles.loadingText}>{title}</Text>
    </View>
  );
};

export default LoadingFull;

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute', // cobre a tela
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center', // centraliza vertical
    alignItems: 'center',     // centraliza horizontal
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
