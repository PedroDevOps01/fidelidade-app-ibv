// // localNotification.ts
// import { Notifications } from 'react-native-notifications';

// export type LocalNotificationOptions = {
//   title: string;
//   body: string;
//   payload?: object;
//   sound?: string;
//   badge?: number;
//   delayMs?: number; // Opcional: agendar para daqui a X ms
// };

// export async function triggerLocalNotification(options: LocalNotificationOptions) {
//   const {
//     title,
//     body,
//     payload = {},
//     sound = "default",
//     badge = 1,
//     delayMs = 0,
//   } = options;

//   const fireDate = delayMs > 0 ? Date.now() + delayMs : undefined;

//   Notifications.postLocalNotification({
//     title,
//     body,
//     sound,
//     badge,
//     payload,
//     identifier: `local-${Date.now()}`,
//     fireDate,
//   });
// }
