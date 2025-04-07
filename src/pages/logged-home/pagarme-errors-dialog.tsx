import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, Button, Text, IconButton, useTheme } from 'react-native-paper';
import { navigate } from '../../router/navigationRef';

interface PagarmeErrorsDialogProps {
  errors: ErrorCadastroPagarme | null | undefined;
  visible: boolean;
  navigation: any;
  handlePress: (status: boolean) => void;
}

const PagarmeErrorsDialog = ({ errors, visible, navigation, handlePress }: PagarmeErrorsDialogProps) => {
  const { colors } = useTheme();

  var errorsToText: string[] = [];

  if (errors?.error) {
    errorsToText = Object.values(errors.error);
  }

  return (
    <Dialog visible={visible} style={[styles.dialog, { backgroundColor: colors.background }]}>
      <Dialog.Title style={styles.title}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Erros no cadastro!</Text>
          {/* <IconButton
                icon="close"
                size={20}
                onPress={hideDialog}
                style={styles.closeButton}
              /> */}
        </View>
      </Dialog.Title>
      <Dialog.Content>
        {errorsToText.map((e, i) => (
          <Text key={i} style={styles.contentText}>
            {e}
          </Text>
        ))}
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
          Corrigir meus dados
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
    width: '100%',
  },
  actionButton: {
    padding: 2,
    flexDirection: 'row-reverse',
  },
});

export default PagarmeErrorsDialog;
