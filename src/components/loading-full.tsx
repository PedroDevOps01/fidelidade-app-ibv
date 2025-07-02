import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { useTheme } from "react-native-paper";


const LoadingFull = ({title = "Carregando..."}: {title?: string}) => {

  const {colors} = useTheme();


  return (
    <View style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.onBackground}]}>{title}</Text>
      </View>
  )

}

export default LoadingFull;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});