import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import Shimmer from 'react-native-shimmer';
import LoadingFull from '../../components/loading-full';

export default function HomeShimmer() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {Platform.OS == 'ios' ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingFull />
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row' }}>
            <Shimmer style={styles.card1} />
            <Shimmer style={[styles.card1, { marginLeft: 10 }]} />
          </View>

          <Shimmer style={styles.card2} />

          <Shimmer style={styles.card3} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingLeft: 16,
  },
  card1: {
    width: 150,
    height: 100,
  },
  card2: {
    marginTop: 30,
    height: 250,
    width: 310,
  },
  card3: {
    marginTop: 30,
    width: 310,
    height: 80,
  },
});
