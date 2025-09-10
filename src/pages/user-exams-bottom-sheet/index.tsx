import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Card, useTheme, Button, IconButton } from 'react-native-paper';
import { useConsultas } from '../../context/consultas-context';
import { navigate } from '../../router/navigationRef';
import { useExames } from '../../context/exames-context';
import CustomBackdrop from '../../components/custom-backdrop-component';

export type UserExamsBottomSheetRef = {
  openBottomSheet: () => void;
  closeBottomSheet: () => void;
};

const UserExamsBottomSheet = forwardRef<UserExamsBottomSheetRef>((_, ref) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const { colors } = useTheme();
  const { selectedExams, removeSelectedExam } = useExames();
  const { setCurrentProcedureMethod } = useConsultas();

  // Expor funções de abrir/fechar o Bottom Sheet
  useImperativeHandle(ref, () => ({
    openBottomSheet: () => bottomSheetRef.current?.expand(),
    closeBottomSheet: () => bottomSheetRef.current?.close(),
  }));

  const dimensions = useWindowDimensions();

  // // Calcular dinamicamente a altura do Bottom Sheet
  // const snapPoints = useMemo(() => {
  //   const itemHeight = 90; // Altura aproximada de cada card + espaçamento
  //   const maxSnap = 450; // Altura máxima do Bottom Sheet
  //   const totalHeight = Math.min(selectedExams.length * itemHeight + 100, maxSnap); // Calcula altura com limite
  //   return [totalHeight];
  // }, [selectedExams]);

  return (
    <BottomSheet
      backdropComponent={CustomBackdrop}
      ref={bottomSheetRef}
      snapPoints={[dimensions.height / 2]}
      index={-1}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.onSurface }}
      handleStyle={{
        backgroundColor: colors.background,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        borderBottomWidth: 0,
      }}>
      <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
        <View style={{ flex: 9 }}>
          <BottomSheetFlatList
            data={selectedExams}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            style={{ paddingHorizontal: 10 }}
            renderItem={({ item }) => (
  <Card style={[styles.card, { backgroundColor: colors.surface }]}>
    <Card.Content style={{ flexDirection: 'row' }}>
      <View style={{ flex: 8, justifyContent: 'center' }}>
        <Text style={[styles.title, { color: colors.onBackground }]}>{item.des_grupo_tpr}</Text>
        {/* Aqui mostramos a descrição */}
        <Text style={{ fontSize: 14, color: colors.onBackground, opacity: 0.7 }}>
          {item.des_tipo_tpr}
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <IconButton
          icon="trash-can-outline"
          size={25}
          iconColor={colors.onErrorContainer}
          onPress={() => removeSelectedExam(item.id_procedimento_tpr)}
        />
      </View>
    </Card.Content>
  </Card>
)}
          />
        </View>

        <View style={{ flex: 2, paddingHorizontal: 10 }}>
          <Button
            key={''}
            mode="contained"
            onPress={() => {
              // Adicionado console.log para mostrar os dados antes de continuar
              console.log('Dados ao clicar em "Continuar":', {
                selectedExams: selectedExams,
                procedureMethod: 'exame',
                navigateToScreen: 'user-exams-check-local-screen'
              });
              
              bottomSheetRef.current?.close();
              setCurrentProcedureMethod('exame');
              navigate('user-exams-check-local-screen');
            }}>
            Continuar
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  card: {
    shadowColor: 'transparent',
    height: 80,
    borderWidth: 0.5
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default UserExamsBottomSheet;
