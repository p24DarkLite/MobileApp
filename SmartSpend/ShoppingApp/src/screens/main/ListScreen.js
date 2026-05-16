import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import { translations } from '../../store/translation';
import { Ionicons } from '@expo/vector-icons';

export default function ListsScreen({ navigation }) {
  const { shoppingLists, deleteList, theme, lang, user, confirmDelete, fetchLists } = useStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date'); 
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalVisible, setModalVisible] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const isDark = theme === 'dark';
  const t = translations[lang || 'ua'];
  const userLists = shoppingLists.filter(l => l.ownerEmail === user?.email);

  const categories = ['All', 'Їжа', 'Одяг та взуття', 'Техніка', 'Ліки', 'Розваги', 'Спорт', 'Дім', 'Інше'];

  const totalBudget = userLists.reduce((sum, list) => sum + (Number(list.budget) || 0), 0);
  const totalSpent = userLists.reduce((sum, list) => {
    const listSpent = list.items?.reduce((s, item) => s + (item.completed ? (Number(item.price) || 0) : 0), 0) || 0;
    return sum + listSpent;
  }, 0);
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) : 0;

  const filteredLists = userLists.filter(l => {
    const matchesSearch = l.name && l.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || l.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedLists = [...filteredLists].sort((a, b) => {
    if (sortBy === 'alpha') {
      return (a.name || '').localeCompare(b.name || '');
    } else {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });

  const handleDeletePress = useCallback((id, name) => {
    if (confirmDelete) {
      setListToDelete({ id, name });
      setModalVisible(true);
    } else {
      deleteList(id);
    }
  }, [confirmDelete, deleteList]);

  const handleConfirmDelete = async () => {
    if (listToDelete) {
      try {
        await deleteList(listToDelete.id);
      } catch (error) {
        console.error("Error deleting list:", error);
      } finally {
        setModalVisible(false);
        setListToDelete(null);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
      <View style={styles.headerSection}>
        <View style={styles.topRow}>
          <Text style={[styles.mainTitle, { color: isDark ? '#fff' : '#000' }]}>{t.myLists}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.analyticsCard, { backgroundColor: isDark ? '#111' : '#fff', borderColor: isDark ? '#333' : '#ddd', borderWidth: isDark ? 1 : 0 }]}
          onPress={() => navigation.navigate('Statistics')}
        >
          <View style={styles.analyticsInfo}>
            <View>
              <Text style={styles.analyticsLabel}>{lang === 'ua' ? 'Витрати' : 'Expenses'}</Text>
              <Text style={[styles.analyticsValue, { color: isDark ? '#4ade80' : '#2e7d32' }]}>
                {totalSpent} / {totalBudget} {userLists[0]?.currency || '₴'}
              </Text>
            </View>
            <Ionicons name="stats-chart" size={24} color="#4ade80" />
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(spentPercentage * 100, 100)}%` }]} />
          </View>
        </TouchableOpacity>

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

        <View style={styles.filterControlsRow}>
          <TouchableOpacity 
            style={[styles.filterCircleSmall, { backgroundColor: showFilters ? '#4ade80' : (isDark ? '#111' : '#fff') }]} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={18} color={showFilters ? '#000' : '#4ade80'} />
          </TouchableOpacity>

          <View style={styles.sortOptions}>
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
        </View>

        {showFilters && (
          <View style={styles.categoryFilterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  onPress={() => setFilterCategory(cat)}
                  style={[styles.catBtn, filterCategory === cat && styles.activeCatBtn]}
                >
                  <Text style={[styles.catBtnText, filterCategory === cat && styles.activeCatBtnText]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: isDark ? '#4ade80' : '#2e7d32' }]}>{item.name}</Text>
                <View style={[styles.miniBadge, { paddingHorizontal: 10, paddingVertical: 4 }]}>
                  <Text style={[styles.miniBadgeText, { fontSize: 12 }]}>{item.category || 'Інше'}</Text>
                </View>
              </View>
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
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })
                    : (item.date || 'Без дати')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDeletePress(item.id, item.name)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>{lang === 'ua' ? 'Списків поки немає' : 'No lists yet'}</Text>
          </View>
        )}
      />

      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
            <View style={styles.iconCircle}><Ionicons name="alert-circle" size={40} color="#ff4444" /></View>
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>{lang === 'ua' ? 'Видалити список?' : 'Delete list?'}</Text>
            <Text style={[styles.modalText, { color: isDark ? '#aaa' : '#666' }]}>
              {lang === 'ua' ? `Видалити "${listToDelete?.name}"?` : `Delete "${listToDelete?.name}"?`}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleConfirmDelete}>
                <Text style={styles.confirmBtnText}>{t.delete}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  headerSection: { marginBottom: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 15 },
  mainTitle: { fontSize: 28, fontWeight: 'bold' },
  filterControlsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  filterCircleSmall: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 2, marginRight: 12 },
  sortOptions: { flexDirection: 'row' },
  categoryFilterContainer: { marginBottom: 15, marginTop: 5 },
  catBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#4ade80' },
  activeCatBtn: { backgroundColor: '#4ade80' },
  catBtnText: { color: '#4ade80', fontSize: 13 },
  activeCatBtnText: { color: '#000', fontWeight: 'bold' },
  analyticsCard: { padding: 18, borderRadius: 22, marginBottom: 20, elevation: 4 },
  analyticsInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  analyticsLabel: { color: '#888', fontSize: 12, marginBottom: 2 },
  analyticsValue: { fontSize: 18, fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4ade80' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, height: 50 },
  searchInput: { flex: 1, marginLeft: 10 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, marginRight: 10, backgroundColor: '#222' },
  activeFilter: { backgroundColor: '#4ade80' },
  filterText: { color: '#aaa', fontSize: 12, fontWeight: 'bold' },
  activeFilterText: { color: '#000' },
  card: { padding: 18, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  miniBadge: { backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: 8 },
  miniBadgeText: { color: '#4ade80', fontWeight: 'bold' },
  cardInfo: { flexDirection: 'row', marginTop: 5, alignItems: 'center' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  dateText: { fontSize: 11, marginLeft: 4, fontStyle: 'italic' },
  deleteBtn: { padding: 5, marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 25, padding: 25, alignItems: 'center' },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, width: '100%' },
  modalBtn: { flex: 1, paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#444' },
  confirmBtn: { backgroundColor: '#ff4444' },
  cancelBtnText: { color: '#aaa', fontSize: 16, fontWeight: '600' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});