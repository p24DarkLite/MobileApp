import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useStore } from '../../store/useStore';
import { translations } from '../../store/translation';
import { Ionicons } from '@expo/vector-icons';

export default function ListsScreen({ navigation }) {
  const { shoppingLists, deleteList, theme, lang, user } = useStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date'); 
  
  const isDark = theme === 'dark';
  const t = translations[lang || 'ua'];

  const userLists = shoppingLists.filter(l => l.ownerEmail === user?.email);

  const filteredLists = userLists.filter(l => 
    l.name && l.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedLists = [...filteredLists].sort((a, b) => {
    if (sortBy === 'alpha') {
      return (a.name || '').localeCompare(b.name || '');
    } else {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });

  const confirmDelete = (id, name) => {
    Alert.alert(
      lang === 'ua' ? 'Видалення списку' : 'Delete List',
      `${lang === 'ua' ? 'Ви впевнені, що хочете видалити' : 'Are you sure you want to delete'} "${name}"?`,
      [
        {
          text: lang === 'ua' ? 'Скасувати' : 'Cancel',
          style: 'cancel',
        },
        {
          text: lang === 'ua' ? 'Видалити' : 'Delete',
          style: 'destructive',
          onPress: () => deleteList(id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#111' : '#fff', borderColor: isDark ? '#333' : '#ddd' }]}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput 
          style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]} 
          placeholder={t.searchPlaceholder} 
          placeholderTextColor="#666" 
          value={search} 
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity 
          onPress={() => setSortBy('date')} 
          style={[styles.filterBtn, sortBy === 'date' && styles.activeFilter]}
        >
          <Text style={[styles.filterText, sortBy === 'date' && styles.activeFilterText]}>
            {lang === 'ua' ? 'Нові' : 'Newest'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSortBy('alpha')} 
          style={[styles.filterBtn, sortBy === 'alpha' && styles.activeFilter]}
        >
          <Text style={[styles.filterText, sortBy === 'alpha' && styles.activeFilterText]}>
            {lang === 'ua' ? 'А-Я' : 'A-Z'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={sortedLists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: isDark ? '#111' : '#fff' }]} 
            onPress={() => navigation.navigate('Details', { listId: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: isDark ? '#4ade80' : '#2e7d32' }]}>{item.name}</Text>
              
              <View style={styles.cardInfo}>
                <Text style={{ color: isDark ? '#aaa' : '#666', fontSize: 13 }}>
                  {item.items ? item.items.length : 0} {t.itemsCount}
                </Text>
                <Text style={{ color: '#4ade80', marginLeft: 10, fontWeight: 'bold' }}>
                  {item.budget} {item.currency || '₴'}
                </Text>
              </View>

              <View style={styles.dateContainer}>
                <Ionicons name="time-outline" size={12} color={isDark ? '#555' : '#999'} />
                <Text style={[styles.dateText, { color: isDark ? '#555' : '#999' }]}>
                  {item.createdAt 
                    ? new Date(item.createdAt).toLocaleString(lang === 'ua' ? 'uk-UA' : 'en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : (item.date || 'Без дати')
                  }
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => confirmDelete(item.id, item.name)} 
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>
              {lang === 'ua' ? 'Списків поки немає' : 'No lists yet'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, height: 50 },
  searchInput: { flex: 1, marginLeft: 10 },
  filterRow: { flexDirection: 'row', marginBottom: 15 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, marginRight: 10, backgroundColor: '#222' },
  activeFilter: { backgroundColor: '#4ade80' },
  filterText: { color: '#aaa', fontSize: 12, fontWeight: 'bold' },
  activeFilterText: { color: '#000' },
  card: { padding: 18, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: 'bold' },
  cardInfo: { flexDirection: 'row', marginTop: 5, alignItems: 'center' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  dateText: { fontSize: 11, marginLeft: 4, fontStyle: 'italic' },
  deleteBtn: { padding: 5, marginLeft: 10 }
});