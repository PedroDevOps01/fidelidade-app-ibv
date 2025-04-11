import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, Button, Text, IconButton, useTheme } from 'react-native-paper';
import { navigate } from '../../router/navigationRef';
import { formatDateToDDMMYYYY, maskBrazilianCurrency } from '../../utils/app-utils';

interface InadimplenciaDialogProps {
  errors: PessoaAssinaturaInadimplencia[] | null | undefined;
  visible: boolean;
  navigation: any;
  handlePress: (status: boolean) => void;
}

const InadimplenciaDialog = ({ errors, visible, navigation, handlePress }: InadimplenciaDialogProps) => {
  const { colors } = useTheme();
  return (
    <Dialog visible={visible} style={[styles.dialog, { backgroundColor: colors.background }]} dismissable onDismiss={() => handlePress(false)}>
      <Dialog.Title style={styles.title}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Você possui {errors?.length} parcelas em aberto!</Text>
        </View>
      </Dialog.Title>
      <Dialog.Content>
        <View>
          {errors?.map((e, i) => (
            <View key={i} style={{ marginVertical: 2 }}>
              <Text>Data: {formatDateToDDMMYYYY(e.data)}</Text>
              <Text>Valor: R$:{maskBrazilianCurrency(e.valor)}</Text>
            </View>
          ))}
        </View>
        <Text variant="bodyMedium" style={{ marginTop: 4, fontWeight: 'bold' }}>
          Acesse "Meu plano" e regularize sua situação!
        </Text>
      </Dialog.Content>
      <Dialog.Actions style={styles.actions}>
        <Button
          onPress={() => {
            handlePress(false);
          }}
          mode="outlined"
          contentStyle={styles.actionButton}>
          Agora não
        </Button>
        <Button
          onPress={() => {
            handlePress(false);
            navigate('user-data');
          }}
          mode="contained"
          contentStyle={styles.actionButton}
          icon={'arrow-right'}>
          Regularizar
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 10,
  },
  title: {
    paddingBottom: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 0,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    justifyContent: 'space-around',
    width: '100%'
  },
  actionButton: {
    padding: 2,
    flexDirection: 'row-reverse',
  },
});

export default InadimplenciaDialog;
