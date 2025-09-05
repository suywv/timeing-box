import React from 'react';
import { StyleSheet, View, I18nManager } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';

// Enable RTL layout if needed
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <View style={styles.container}>
          <HomeScreen />
        </View>
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});