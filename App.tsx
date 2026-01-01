import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './app/navigation/AppNavigator';
import { FilterProvider } from './app/context/FilterContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <FilterProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </FilterProvider>
    </SafeAreaProvider>
  );
}