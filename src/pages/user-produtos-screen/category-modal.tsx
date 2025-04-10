import {
  Alert,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Chip,
  Modal,
  Portal,
  Title,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';
import { NewListItem } from '../../types/new__list_item';
import { useEffect, useState } from 'react';
import { api } from '../../network/api';
import CustomToast from '../../components/custom-toast';

const MAX_MODAL_HEIGHT = Dimensions.get('window').height * 0.7;

export default function CategoryModal({
  showCategoryModal,
  onDismiss,
  colors,
  onSubmit,
  access_token,
  multi_enabled = true,
}: {
  showCategoryModal: boolean;
  onDismiss: () => void;
  colors: MD3Colors;
  onSubmit: (ids: number[]) => void;
  access_token: string;
  multi_enabled?: boolean;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function requestCategories() {
    try {
      const response = await api.get('/categorias-produto', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `bearer ${access_token}`,
        },
      });

      if (response.status === 200) {
        const { data } = response;
        const mapped = data.response.data.map((item: any) => ({
          label: String(item.nome_categoria_cpp),
          value: String(item.nome_categoria_cpp),
          _id: String(item.id_categoria_cpp),
        }));
        setCategories(mapped);
      }
    } catch (err) {
      onDismiss()
      CustomToast('Erro ao carregar categorias', colors)
    } finally {
      setLoading(false);
    }
  }

  const toggleChip = (item: NewListItem) => {
    if (multi_enabled) {
      const exists = selectedList.some((i) => i._id === item._id);
      setSelectedList((prev) =>
        exists
          ? prev.filter((i) => i._id !== item._id)
          : [...prev, item]
      );
    } else {
      setSelectedList([item]);
    }
  };

  const isSelected = (id: string) =>
    selectedList.some((i) => i._id === id);

  useEffect(() => {
    if (showCategoryModal) {
      setSelectedList([]); // opcional: resetar seleção ao abrir
      requestCategories();
    }
  }, [showCategoryModal]);

  return (
    <Portal>
      <Modal
        dismissable={false}
        visible={showCategoryModal}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.surface }]}
      >
        <View style={styles.innerView}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Title style={{ marginBottom: 12 }}>Categorias</Title>
              <ScrollView style={{ maxHeight: MAX_MODAL_HEIGHT }}>
                <View style={styles.chipContainer}>
                  {categories.map((cat) => (
                    <Chip
                      key={cat._id}
                      selected={isSelected(cat._id)}
                      onPress={() => toggleChip(cat)}
                      style={styles.chip}
                      mode="outlined"
                    >
                      {cat.label}
                    </Chip>
                  ))}
                </View>
              </ScrollView>

              <Button
                mode="contained"
                style={{ marginTop: 16 }}
                onPress={() => {
                  const ids = selectedList.map((e) => Number(e._id));
                  onSubmit(ids);
                  onDismiss();
                }}
              >
                Confirmar
              </Button>
            </>
          )}
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: '5%',
    padding: 16,
    borderRadius: 12,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  innerView: {
    flexDirection: 'column',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
});
