import React from 'react';
import { StyleSheet, Text, View, I18nManager } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

// Enable RTL layout if needed
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
}

export default function App() {
  return (
    <View style={styles.container}>
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});