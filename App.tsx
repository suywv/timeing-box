import React from 'react';
import { StyleSheet, View, I18nManager } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';

// Enable RTL layout if needed
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
}

export default function App() {
  return (
    <AppProvider>
      <View style={styles.container}>
        <HomeScreen />
      </View>
    </AppProvider>
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