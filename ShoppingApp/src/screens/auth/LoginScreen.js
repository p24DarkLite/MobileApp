import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useStore } from '../../store/useStore';
import { translations } from '../../store/translation';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const { loginUser, theme, toggleTheme, lang, setLanguage } = useStore();
  const isDark = theme === 'dark';
  const t = translations[lang || 'ua'];

  const handleLogin = () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!email) setEmailError(lang === 'ua' ? 'Введіть пошту' : 'Enter email');
    if (!password) setPasswordError(lang === 'ua' ? 'Введіть пароль' : 'Enter password');
    if (!email || !password) return;

    const success = loginUser(email, password);
    if (!success) {
      setGeneralError(t.errorLogin);
    }
  };

  const textColor = isDark ? '#fff' : '#000';
  const inputBg = isDark ? '#111' : '#f0f0f0';
  const inputBorder = isDark ? '#333' : '#ddd';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}
    >
      <View style={styles.headerSettings}>
        <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLanguage(lang === 'ua' ? 'en' : 'ua')} style={styles.langBtn}>
          <Text style={[styles.langText, { color: textColor }]}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          <Text style={styles.title}>{t.login}</Text>

          <View style={styles.inputGroup}>
            <TextInput 
              style={[styles.input, { borderColor: emailError ? '#ff4444' : inputBorder, color: textColor, backgroundColor: inputBg }]} 
              placeholder={t.email} 
              placeholderTextColor="#666"
              value={email}
              onChangeText={(t) => { setEmail(t); setEmailError(''); }}
              autoCapitalize="none"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <TextInput 
              style={[styles.input, { borderColor: passwordError ? '#ff4444' : inputBorder, color: textColor, backgroundColor: inputBg }]} 
              placeholder={t.password} 
              secureTextEntry 
              placeholderTextColor="#666"
              value={password}
              onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleLogin}>
            <Text style={styles.btnText}>{t.login}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.blueLinkText}>{lang === 'ua' ? 'Немає акаунту? Реєстрація' : "Don't have an account? Register"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerSettings: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 50, gap: 20 },
  iconBtn: { padding: 10 },
  langBtn: { padding: 10, borderWidth: 1, borderRadius: 10, borderColor: '#4ade80' },
  langText: { fontWeight: 'bold' },
  scrollContainer: { flexGrow: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 25, paddingBottom: 100 },
  title: { fontSize: 42, color: '#4ade80', fontWeight: 'bold', textAlign: 'center', marginBottom: 50 },
  inputGroup: { marginBottom: 15 },
  input: { padding: 18, borderRadius: 15, borderWidth: 1 },
  errorText: { color: '#ff4444', fontSize: 13, marginTop: 5, textAlign: 'center' },
  generalError: { color: '#ff4444', textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  btn: { backgroundColor: '#4ade80', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { fontWeight: 'bold', fontSize: 18, color: '#000' },
  registerLink: { marginTop: 30, alignSelf: 'center', padding: 10 },
  blueLinkText: { color: '#007AFF', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' }
});