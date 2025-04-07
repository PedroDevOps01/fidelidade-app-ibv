import React from 'react';
import { View} from 'react-native';
import { Button, Text  } from 'react-native-paper';

interface ModalContextProps {
  isBackButtonVisible: boolean;
  backButtonText?: string;
  confirmButtonText: string;
  confirmButtonAction: () => void;
  backButtonAction?: () => void;
  title: string;
  description: string;
}

export const ModalContent: React.FC<ModalContextProps> = ({
  isBackButtonVisible,
  backButtonText,
  confirmButtonText,
  confirmButtonAction,
  backButtonAction,
  title,
  description,
}) => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>{title}</Text>
      <Text style={{ fontSize: 16, marginBottom: 24 }}>{description}</Text>

      <View style={{ flexDirection: 'row', justifyContent: isBackButtonVisible ? 'space-between' : 'center' }}>
        {isBackButtonVisible && (
          <Button
            mode="outlined"
            onPress={backButtonAction}
            style={{ flex: 1, marginRight: 8 }}
            contentStyle={{ justifyContent: 'center' }}
          >
            {backButtonText}
          </Button>
        )}
        <Button
          mode="contained"
          onPress={confirmButtonAction}
          style={{ flex: 1, marginLeft: isBackButtonVisible ? 8 : 0 }}
          contentStyle={{ justifyContent: 'center' }}
        >
          {confirmButtonText}
        </Button>
      </View>
    </View>
  );
};
