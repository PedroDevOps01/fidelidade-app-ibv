import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import ImageViewing from 'react-native-image-viewing';

interface ImageViewerPreviewProps {
  uri: string;
  onLong: (uri: string) => void;
  type? : 'small' | 'large';
}

const ImageViewerPreview = ({ uri, onLong, type = 'small' }: ImageViewerPreviewProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        onLongPress={() => {
          onLong(uri);
        }}>
        <Image source={{ uri }} style={type == 'small' ? styles.thumbnail : { width: '100%', height: 200, borderRadius: 8 }} resizeMode="cover" />
      </TouchableOpacity>

      <ImageViewing
        images={[{ uri }]} // Apenas uma imagem em um array
        imageIndex={0} // Começa da primeira imagem
        visible={visible}
        onRequestClose={() => setVisible(false)} // Fecha ao pressionar fora ou voltar
      />
    </View>
  );
};

export default ImageViewerPreview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 200,
    height: 200,
    borderRadius: 8,
    margin: 2,
  },
});
