import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useStore } from '../../store/useStore';

export default function EditListScreen({ route, navigation }) {
  const { listId } = route.params;
  const { shoppingLists, updateList, theme, lang } = useStore();
  const isDark = theme === 'dark';
  
  const currentList = shoppingLists.find(l => l.id === listId);

  const [name, setName] = useState(currentList?.name || '');
  const [budget, setBudget] = useState(currentList?.budget?.toString() || '0');
  const [category, setCategory] = useState(currentList?.category || 'Інше');

  const categories = ['Їжа', 'Одяг та взуття', 'Техніка', 'Ліки', 'Розваги', 'Спорт', 'Дім', 'Інше'];

  const handleSave = () => {
    if (!name.trim()) return;
    updateList(listId, { 
      name: name.trim(), 
      budget: Number(budget) || 0, 
      category: category 
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={[styles.card, { backgroundColor: isDark ? '#111' : '#fff' }]}>
          <Text style={styles.label}>{lang === 'ua' ? 'Назва списку' : 'List Name'}</Text>
          <TextInput 
            style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#333' : '#ddd' }]} 
            value={name} 
            onChangeText={setName} 
          />

          <Text style={styles.label}>{lang === 'ua' ? 'Бюджет' : 'Budget'}</Text>
          <TextInput 
            style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#333' : '#ddd' }]} 
            value={budget} 
            onChangeText={setBudget} 
            keyboardType="numeric"
          />

          <Text style={styles.label}>{lang === 'ua' ? 'Категорія' : 'Category'}</Text>
          <View style={styles.catContainer}>
            {categories.map(c => (
              <TouchableOpacity 
                key={c} 
                style={[
                  styles.catChip, 
                  { backgroundColor: isDark ? '#222' : '#eee' },
                  category === c && styles.activeChip
                ]} 
                onPress={() => setCategory(c)}
              >
                <Text style={{ 
                  color: category === c ? '#000' : (isDark ? '#aaa' : '#666'), 
                  fontWeight: category === c ? 'bold' : 'normal',
                  fontSize: 13
                }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{lang === 'ua' ? 'Зберегти зміни' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 20, borderRadius: 25, elevation: 2 },
  label: { color: '#4ade80', fontWeight: 'bold', marginBottom: 8, marginTop: 15, fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 15, padding: 15, fontSize: 16, marginBottom: 5 },
  catContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  activeChip: { backgroundColor: '#4ade80' },
  saveBtn: { backgroundColor: '#4ade80', padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});