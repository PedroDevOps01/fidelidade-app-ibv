import { StyleSheet, View } from 'react-native';
import {
  Divider, IconButton,
  List, useTheme
} from 'react-native-paper';

interface ModalContentGalleryProps {
  hancleCloseButton: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}


const ModalContentGallery = ({ hancleCloseButton, onCameraPress, onGalleryPress }: ModalContentGalleryProps) => {
  const theme = useTheme();

  return (
    <View>
      <IconButton
        icon={'close'}
        size={26}
        style={{alignSelf: 'flex-end'}}
        onPress={hancleCloseButton}
      />

      <List.Section>
        <List.Item
          title="Capturar foto"
          titleStyle={{textAlign: 'center'}}
          left={() => <List.Icon icon="camera" />}
          onPress={onCameraPress}
        />
        <Divider />
        <List.Item
          title="Selecionar da galeria"
          titleStyle={{textAlign: 'center'}}
          left={() => <List.Icon icon="image" />}
          onPress={() => {
            hancleCloseButton()
            onGalleryPress()
          }}
        />
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({});

export default ModalContentGallery;
