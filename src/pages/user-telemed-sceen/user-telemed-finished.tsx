import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { goBack, goHome } from "../../router/navigationRef";

const UserTelemedFinished = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="titleLarge" style={styles.title}>
        Chamada encerrada
      </Text>

      <Text style={styles.subtitle}>
        Sua consulta por vídeo foi finalizada com sucesso.
      </Text>

      <Button mode="contained" onPress={() => goHome()} style={styles.button}>
        Voltar para o início
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#6b7280",
  },
  button: {
    width: "80%",
  },
});

export default UserTelemedFinished;
