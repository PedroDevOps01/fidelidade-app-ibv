import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { useDadosUsuario } from "../../context/pessoa-dados-context"
import { StyleSheet, Text } from "react-native"

export default function UserMdvPresentation() {
  
  const {dadosUsuarioData} = useDadosUsuario()
  
  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      
      






    </KeyboardAwareScrollView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});