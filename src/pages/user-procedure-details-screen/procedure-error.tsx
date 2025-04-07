import { View, StyleSheet } from 'react-native';
import { Text, Avatar, useTheme } from 'react-native-paper';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';

type ProcedureErrorProps = {
  icon: string;
  title: string;
  body: string;
};

export default function ProcedureError({ icon, title, body }: ProcedureErrorProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Avatar.Icon size={100} icon={icon} style={{ backgroundColor: colors.error, marginBottom: 20 }} />
      <Text variant="headlineMedium" style={[styles.text, { color: colors.onSurface }]}>
        {title}
      </Text>
      <Text variant="bodyLarge" style={[styles.subtext, { color: colors.onSurfaceVariant }]}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginTop: 8,
    fontWeight: '700', // Mais moderno com peso de fonte mais forte
    textAlign: 'center',
  },
  subtext: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24, // Melhor legibilidade
  },
});
