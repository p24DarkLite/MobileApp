import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { translations } from '../store/translation';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ListsScreen from '../screens/main/ListScreen';
import CreateListScreen from '../screens/main/CreateListScreen';
import SettingsScreen from '../screens/main/SettingScreen';
import ListDetailScreen from '../screens/main/ListDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme, lang } = useStore();
  const isDark = theme === 'dark';
  const t = translations[lang || 'ua'];

  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: '#4ade80',
      tabBarStyle: { backgroundColor: isDark ? '#000' : '#fff', borderTopWidth: 0, height: 60, paddingBottom: 8 },
      headerStyle: { backgroundColor: isDark ? '#000' : '#fff' },
      headerTintColor: isDark ? '#fff' : '#000',
    }}>
      <Tab.Screen name="Lists" component={ListsScreen} options={{ 
        title: t.lists, 
        tabBarIcon: ({color}) => <Ionicons name="list" size={24} color={color}/> 
      }} />
      <Tab.Screen name="Create" component={CreateListScreen} options={{ 
        title: t.create, 
        tabBarIcon: ({color}) => <Ionicons name="add-circle" size={32} color={color}/> 
      }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ 
        title: t.settings, 
        tabBarIcon: ({color}) => <Ionicons name="settings" size={24} color={color}/> 
      }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, theme, lang } = useStore();
  const isDark = theme === 'dark';
  const t = translations[lang || 'ua'];

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Details" component={ListDetailScreen} options={{ 
              headerShown: true, title: t.products,
              headerStyle: { backgroundColor: isDark ? '#000' : '#fff' },
              headerTintColor: isDark ? '#fff' : '#000'
            }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}