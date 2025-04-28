import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS, checkMultiple, requestMultiple, Permission } from 'react-native-permissions';

export async function requestPermissions(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    // Define permissões de acordo com a plataforma
    const permissions: Permission[] =
      Platform.select({
        android: [
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.RECORD_AUDIO,
          PERMISSIONS.ANDROID.POST_NOTIFICATIONS
          // PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        ],
        ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE, 
          // PERMISSIONS.IOS.PHOTO_LIBRARY
        ],
      }) || [];

    if (!permissions) {
      return reject('Permissões não configuradas para esta plataforma.');
    }

    try {
      // Verifica o status de todas as permissões
      const statuses = await checkMultiple(permissions);

      // Filtra permissões que precisam ser solicitadas
      const toRequest: Permission[] = Object.entries(statuses)
        .filter(([, status]) => status === RESULTS.DENIED)
        .map(([permission]) => permission as Permission);

      if (toRequest.length > 0) {
        // Solicita as permissões pendentes
        const results = await requestMultiple(toRequest);

        const allGranted = Object.values(results).every(result => result === RESULTS.GRANTED);

        if (allGranted) {
          resolve('Todas as permissões concedidas');
        } else {
          reject('Algumas permissões foram negadas');
        }
      } else if (Object.values(statuses).every(status => status === RESULTS.GRANTED)) {
        resolve('Permissões já concedidas');
      } else {
        reject('Alguma permissão está bloqueada. Vá para as configurações do dispositivo para alterar.');
      }
    } catch (error: any) {
      reject(`Erro ao verificar permissões: ${error.message}`);
    }
  });
}

export async function arePermissionsGranted(platformPermissions: { android?: Permission[]; ios?: Permission[] }): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      // Filtra permissões de acordo com a plataforma
      const permissions: Permission[] =
        Platform.select({
          android: platformPermissions.android || [],
          ios: platformPermissions.ios || [],
        }) || [];

      if (!permissions.length) {
        return reject('Nenhuma permissão configurada para esta plataforma.');
      }

      // Verifica o status das permissões
      const statuses = await checkMultiple(permissions);

      // Retorna true se todas as permissões estiverem concedidas
      const allGranted = Object.values(statuses).every(status => status === RESULTS.GRANTED);

      resolve(allGranted);
    } catch (error: any) {
      reject(`Erro ao verificar permissões: ${error.message}`);
    }
  });
}
