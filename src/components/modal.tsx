import * as React from 'react';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface ModalContainerProps {
  visible: boolean;
  handleVisible: () => void;
  children: React.ReactNode;
}

const ModalContainer = ({
  children,
  handleVisible,
  visible,
}: ModalContainerProps) => {
  const theme = useTheme();
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleVisible}
        dismissable={false}
        contentContainerStyle={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            {backgroundColor: theme.colors.surface},
          ]}>
          {children}
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    alignSelf: 'center'
  },
  modalContent: {
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 8,
    minWidth: '90%', // Controla a largura do conteúdo
  },
});

export default ModalContainer;
