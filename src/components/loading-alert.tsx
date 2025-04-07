import React, {useState} from 'react';
import {
  ActivityIndicator,
  Dialog,
  Portal,
  Text,
  Provider,
  useTheme,
  Button
} from 'react-native-paper';

interface LoadingAlertProps {
  title: string;
  message: string;
  showButtons: boolean;
  isVisible: boolean;
  setIsVisible?: () => void;
  loading: boolean;
  dismissable?: boolean
}

const LoadingAlert = ({
  title,
  message,
  showButtons,
  isVisible,
  setIsVisible,
  loading,
  dismissable = true
}: LoadingAlertProps) => {
  const theme = useTheme();

  return (
      <Portal>
        <Dialog visible={isVisible} style={{backgroundColor: theme.colors.background}} dismissable={dismissable}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content style={{flexDirection: 'row', alignItems: 'center'}} >
            {loading && (<ActivityIndicator
              animating={true}
              size="large"
              style={{marginRight: 16}}
              color={theme.colors.primary}
            />)}
            
            <Text>{message}</Text>
          </Dialog.Content>
          {showButtons && (
            <Dialog.Actions>
              <Button onPress={setIsVisible}>Continuar</Button>
            </Dialog.Actions>
          )}
        </Dialog>
      </Portal>
  );
};

export default LoadingAlert;
