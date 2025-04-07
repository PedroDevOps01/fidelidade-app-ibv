import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import {
  Asset,
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import ModalContainer from '../../components/modal';
import ModalContentGallery from './modal-content-gallery';
import ImageViewerPreview from './image-viewer-preview';

interface ImageGalleryGridProps {
  images: {uri: string}[];
  setImages: (assets: Asset[]) => void;
  deleteImage: (uri: string) => void;
  isProdutoActive: boolean
}

const ImageGalleryGrid = ({
  images,
  setImages,
  deleteImage,
  isProdutoActive
}: ImageGalleryGridProps) => {
  const theme = useTheme();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const launchGallery = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1 - images.length,
    };

    await launchImageLibrary(options, (data: ImagePickerResponse) => {
      setImages(data.assets!);
    });
  };

  const launchCam = async () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: true,
    };

    await launchCamera(options, (data: ImagePickerResponse) => {
      setImages(data.assets!);
    });
  };

  const AddImagesButton = () => (
    <Button
      mode="contained"
      icon="plus"
      disabled={isProdutoActive}
      onPress={() => {
        setIsModalVisible(true);
      }}>
      Adicionar Fotos
    </Button>
  );

  return (
    <View>
      <ModalContainer
        visible={isModalVisible}
        handleVisible={() => setIsModalVisible(prev => !prev)}>
        <ModalContentGallery
          hancleCloseButton={() => setIsModalVisible(false)}
          onCameraPress={launchCam}
          onGalleryPress={launchGallery}
        />
      </ModalContainer>

      {images.length < 1 ? (
        <View style={styles.containerWithoutPhotos}>
          <AddImagesButton />
        </View>
      ) : (
        <></>
      )}

      {images.length > 0 ? (
        <View style={styles.containerWithoutPhotos}>
          <View style={[styles.container, {borderColor: theme.colors.primary}]}>
            {images.map((e, i) => (
              <ImageViewerPreview key={i} uri={e.uri} onLong={deleteImage} />
            ))}
          </View>
          <Text style={styles.footerMessage}>
            "Para deletar uma imagem, pressione e segure sobre a imagem desejada
            por alguns segundos."
          </Text>

        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    width: '100%',
    marginBottom: 0,
    borderWidth: 1,
    minHeight: 110,
    maxHeight: 220,
    //height: 'auto',
    borderRadius: 6,
    marginTop: 2,
    overflow: 'scroll',
    justifyContent: 'center',
    padding: 2,
  },
  containerWithoutPhotos: {
    marginVertical: 10,
  },
  footerMessage: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
    color: '#6b7280', // Cinza moderno (Tailwind gray-500)
    marginVertical: 8,
    paddingHorizontal: 16,
    lineHeight: 20, // Melhor legibilidade
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default ImageGalleryGrid;
