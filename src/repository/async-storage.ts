import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeAsyncStorageData = async (
  key: string,
  value: object,
  onSuccess?: (message: string) => void,
  onError?: (message: string) => void,
) => {
  try {
    const parsedValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, parsedValue);
    onSuccess && onSuccess("Dados salvos com sucesso")
  } catch (e) {
    onError && onError("Erro ao salvar dados: \n" + JSON.stringify(e))
  }
};


export const getAsyncStorageData = async (key: string, onError?: (message: string) => void) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    onError && onError(String(e))
  }
};



export const logAllAsyncStorageData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);

    result.forEach(([key, value]) => {
      console.log(`Key: ${key}, Value: ${value}`);
    });
  } catch (error) {
    console.error('Failed to load AsyncStorage data', error);
  }
};