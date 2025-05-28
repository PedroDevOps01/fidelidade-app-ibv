import { MD3Colors } from 'react-native-paper/lib/typescript/types';
import { toast } from 'sonner-native';

export default function CustomToast(
  title: string,
  colors: MD3Colors,
  type: 'error' | 'success' | 'warning' = 'error',
  duration = 5000
) {
  const toastprops: any = {
    position: 'bottom-center',
    duration,
    styles: {
      toast: {
        backgroundColor: colors.inverseSurface,
      },
      title: {
        color: colors.inverseOnSurface,
      },
    },
  };

  switch (type) {
    case 'error':
      toast.error(title, toastprops);
      break;
    case 'success':
      toast.success(title, toastprops);
      break;
    case 'warning':
      toast.warning(title, toastprops);
      break;
    default:
      toast.error(title, toastprops);
      break;
  }

}
