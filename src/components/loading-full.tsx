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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
