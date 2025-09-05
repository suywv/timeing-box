import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, I18nManager, StatusBar, Platform } from 'react-native';
import { AppProvider, useAppContext } from './src/context/AppContext';
import { ThemeProvider } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';

// Enable RTL layout if needed
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
}

// Main app component that handles RTL forcing
function AppContent() {
  const { state } = useAppContext();
  
  useEffect(() => {
    const shouldForceRTL = state.language === 'ar' || state.forceRTL;
    if (shouldForceRTL !== I18nManager.isRTL) {
      I18nManager.forceRTL(shouldForceRTL);
      // Note: In production, you might want to restart the app here
      // RNRestart.Restart(); // if using react-native-restart
    }
  }, [state.language, state.forceRTL]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <HomeScreen />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});