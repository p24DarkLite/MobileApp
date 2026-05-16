import React from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { StatusBar } from 'react-native';
import { useStore } from './src/store/useStore';

export default function App() {
  const theme = useStore((state) => state.theme);
  
  return (
    <>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </>
  );
}