import React from 'react';
import { StyleSheet, SafeAreaView, I18nManager, StatusBar, Platform } from 'react-native';
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
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
            backgroundColor="transparent"
            translucent={Platform.OS === 'android'}
          />
          <HomeScreen />
        </SafeAreaView>
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});