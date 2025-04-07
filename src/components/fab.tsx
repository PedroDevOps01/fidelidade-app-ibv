import {StyleSheet, useColorScheme} from 'react-native';
import {FAB} from 'react-native-paper';

const Fab = ({icon, onPress}: {icon: string; onPress: () => void}) => {
  const scheme = useColorScheme();
  return (
    <FAB
      icon={icon}
      style={[
        styles.fab,
        {shadowColor: scheme === 'dark' ? 'transparent' : 'black'},
      ]}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
export default Fab;
