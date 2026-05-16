import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Switch, TouchableOpacity, Image,
  Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../../store/useStore';
import { translations } from '../../store/translation';
import { Ionicons } from '@expo/vector-icons';

export default function SettingScreen() {
  const { theme, toggleTheme, logout, lang, setLanguage, user, updateUserProfile, confirmDelete, setConfirmDelete } = useStore();
  const [isMenuVisible, setMenuVisible] = useState(false);
  
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photo, setPhoto] = useState(user?.photo || null);

  const isDark = theme === 'dark';
  const t = translations[lang || 'ua'];
  
  const languages = [
    { id: 'ua', label: 'Українська', flag: '🇺🇦' },
    { id: 'en', label: 'English', flag: '🇺🇸' }
  ];

  const currentLang = languages.find(l => l.id === lang) || languages[0];

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || user.email.split('@')[0]);
      setEmail(user.email || '');
      setPhoto(user.photo || null);
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(lang === 'ua' ? 'Помилка' : 'Error', lang === 'ua' ? 'Потрібен доступ.' : 'Access required.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSaveProfile = () => {
    updateUserProfile({ nickname, email, photo });
    Alert.alert(lang === 'ua' ? 'Збережено' : 'Saved');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>{t.settings}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{lang === 'ua' ? 'МІЙ ПРОФІЛЬ' : 'MY PROFILE'}</Text>
          <View style={[styles.profileCard, { backgroundColor: isDark ? '#111' : '#f9f9f9', borderColor: isDark ? '#222' : '#eee' }]}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              {photo ? <Image source={{ uri: photo }} style={styles.avatar} /> : (
                <View style={[styles.avatar, { backgroundColor: '#4ade80' }]}>
                  <Text style={styles.avatarText}>{nickname ? nickname[0].toUpperCase() : 'U'}</Text>
                </View>
              )}
              <View style={styles.cameraIcon}><Ionicons name="camera" size={14} color="#000" /></View>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <TextInput style={[styles.profileInput, { color: isDark ? '#fff' : '#000', borderBottomColor: isDark ? '#333' : '#ddd' }]} value={nickname} onChangeText={setNickname} placeholder="Nickname" placeholderTextColor="#666" />
              <TextInput style={[styles.profileInput, { color: isDark ? '#fff' : '#000', borderBottomColor: isDark ? '#333' : '#ddd' }]} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>
          <TouchableOpacity style={styles.saveProfileBtn} onPress={handleSaveProfile}>
            <Ionicons name="save-outline" size={18} color="#4ade80" style={{ marginRight: 8 }} />
            <Text style={styles.saveProfileText}>{lang === 'ua' ? 'Зберегти зміни' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: isDark ? '#222' : '#eee' }]} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{lang === 'ua' ? 'КЕРУВАННЯ ТА БЕЗПЕКА' : 'MANAGEMENT & SECURITY'}</Text>
          <View style={styles.row}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18 }}>{lang === 'ua' ? 'Підтверджувати видалення' : 'Confirm deletion'}</Text>
            <Switch value={confirmDelete} onValueChange={setConfirmDelete} trackColor={{ true: '#4ade80' }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.theme}</Text>
          <View style={styles.row}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18 }}>{t.mode}: {isDark ? t.dark : t.light}</Text>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: '#4ade80' }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.language}</Text>
          <TouchableOpacity style={[styles.dropdown, { backgroundColor: isDark ? '#111' : '#f4f4f4', borderColor: isDark ? '#333' : '#ddd' }]} onPress={() => setMenuVisible(true)}>
            <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18 }}>{currentLang.flag} {currentLang.label}</Text>
            <Ionicons name="chevron-down" size={20} color="#4ade80" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>

        <Modal visible={isMenuVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
            <View style={[styles.menuContainer, { backgroundColor: isDark ? '#222' : '#fff' }]}>
              {languages.map(item => (
                <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => { setLanguage(item.id); setMenuVisible(false); }}>
                  <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18 }}>{item.flag} {item.label}</Text>
                  {lang === item.id && <Ionicons name="checkmark" size={24} color="#4ade80" />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, marginTop: 40 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#4ade80', fontWeight: 'bold', marginBottom: 15, fontSize: 12, letterSpacing: 1.2 },
  divider: { height: 1, marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, borderWidth: 1 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: '#000' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4ade80', borderRadius: 10, padding: 4, borderWidth: 2, borderColor: '#000' },
  profileInput: { fontSize: 16, paddingVertical: 5, borderBottomWidth: 1, marginBottom: 5 },
  saveProfileBtn: { flexDirection: 'row', backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4ade80', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  saveProfileText: { color: '#4ade80', fontWeight: 'bold', fontSize: 14 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { width: '80%', borderRadius: 20, padding: 10 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#444' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#ff4444', padding: 18, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});