import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import { translations } from '../../store/translation';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { registerUser, theme, toggleTheme, lang, setLanguage } = useStore();
  const isDark = theme === 'dark';
  const t = translations[lang || 'ua'];

  const handleRegister = () => {
    if (!username || !email || password.length < 6) {
      Alert.alert(
        lang === 'ua' ? "Помилка" : "Error", 
        lang === 'ua' ? "Заповніть всі поля. Пароль - мін. 6 символів" : "Fill all fields. Password - min 6 chars"
      );
      return;
    }
    if (registerUser({ username, email, password })) {
    } else {
      Alert.alert(t.errorLogin, lang === 'ua' ? "Цей Email вже зайнятий" : "This Email is already taken");
    }
  };

  const textColor = isDark ? '#fff' : '#000';
  const inputBg = isDark ? '#111' : '#f0f0f0';
  const inputBorder = isDark ? '#333' : '#ddd';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      <View style={styles.headerSettings}>
        <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLanguage(lang === 'ua' ? 'en' : 'ua')} style={styles.langBtn}>
          <Text style={[styles.langText, { color: textColor }]}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{lang === 'ua' ? 'Реєстрація' : 'Register'}</Text>
        
        <TextInput 
          style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorder }]} 
          placeholder={lang === 'ua' ? "Нікнейм" : "Username"} 
          placeholderTextColor="#666" 
          value={username} 
          onChangeText={setUsername} 
        />
        <TextInput 
          style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorder }]} 
          placeholder={t.email} 
          placeholderTextColor="#666" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
        />
        <TextInput 
          style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorder }]} 
          placeholder={t.password} 
          secureTextEntry 
          placeholderTextColor="#666" 
          value={password} 
          onChangeText={setPassword} 
        />
        
        <TouchableOpacity style={styles.btn} onPress={handleRegister}>
          <Text style={styles.btnText}>{lang === 'ua' ? 'Зареєструватися' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.blueLink}>{lang === 'ua' ? 'Вже є акаунт? Увійти' : 'Already have an account? Login'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSettings: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 50, gap: 20 },
  iconBtn: { padding: 10 },
  langBtn: { padding: 10, borderWidth: 1, borderRadius: 10, borderColor: '#4ade80' },
  langText: { fontWeight: 'bold' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 25, paddingBottom: 100 },
  title: { fontSize: 32, color: '#4ade80', fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { padding: 18, borderRadius: 15, marginBottom: 15, borderWidth: 1 },
  btn: { backgroundColor: '#4ade80', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  blueLink: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 15, fontWeight: '500' }
});