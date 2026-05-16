import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useStore } from '../../store/useStore';
import { translations } from '../../store/translation'; 
import { Ionicons } from '@expo/vector-icons';

export default function ListDetailScreen({ route, navigation }) {
  const { listId } = route.params;
  const { shoppingLists, addItem, toggleItem, deleteItem, theme, lang, confirmDelete } = useStore(); 
  const isDark = theme === 'dark';
  const t = translations[lang || 'ua']; 
  const currentList = shoppingLists.find(l => l.id === listId);
  
  const [itemName, setItemName] = useState('');
  const [isPriceModalVisible, setPriceModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  
  if (!currentList) return null;

  const listCurrency = currentList?.currency || 'грн';
  const budget = Number(currentList?.budget) || 0;
  const totalSpent = currentList?.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0;
  const isOverBudget = totalSpent > budget;

  const recommendations = shoppingLists
    .flatMap(list => list.items)
    .filter(item => {
      if (!item.nextDate) return false;
      const today = new Date();
      const nextDate = new Date(item.nextDate);
      return nextDate <= new Date(today.setDate(today.getDate() + 1));
    })
    .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i)
    .filter(rec => !currentList.items.some(item => item.name.toLowerCase() === rec.name.toLowerCase()))
    .slice(0, 5);

  const handleAddItem = () => {
    if (!itemName.trim()) return;
    addItem(listId, itemName);
    setItemName('');
  };

  const openPriceModal = (id) => {
    setSelectedItemId(id);
    setTempPrice('');
    setPriceModalVisible(true);
  };

  const handleDeletePress = (id) => {
    if (confirmDelete) {
      setSelectedItemId(id);
      setDeleteModalVisible(true);
    } else {
      deleteItem(listId, id);
    }
  };

  const confirmPrice = () => {
    toggleItem(listId, selectedItemId, tempPrice);
    setPriceModalVisible(false);
    setTempPrice('');
  };

  const confirmDeletion = () => {
    deleteItem(listId, selectedItemId);
    setDeleteModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.listName, { color: isDark ? '#fff' : '#000' }]}>{currentList.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{currentList.category || 'Інше'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('EditList', { listId: listId })}
        >
          <Ionicons name="create-outline" size={24} color="#4ade80" />
        </TouchableOpacity>
      </View>

      <View style={[styles.budgetCard, { backgroundColor: isOverBudget ? (isDark ? '#441111' : '#ffebee') : (isDark ? '#111' : '#f4f4f4') }]}>
        <Text style={{ color: isDark ? '#aaa' : '#666' }}>{t.budget}: {budget} {listCurrency}</Text>
        <Text style={[styles.spentText, { color: isOverBudget ? '#ff4444' : '#4ade80' }]}>{t.spent}: {totalSpent} {listCurrency}</Text>
      </View>

      {recommendations.length > 0 && (
        <View style={styles.recommendationContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#4ade80' : '#2d6a4f' }]}>✨ {lang === 'ua' ? 'Розумні поради' : 'Smart Suggestions'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recScroll}>
            {recommendations.map((rec) => (
              <TouchableOpacity key={rec.id} style={[styles.recChip, { backgroundColor: isDark ? '#1a1a1a' : '#e8f5e9' }]} onPress={() => addItem(listId, rec.name)}>
                <Ionicons name="flash-outline" size={16} color="#4ade80" />
                <Text style={[styles.recText, { color: isDark ? '#fff' : '#000' }]}>{rec.name}</Text>
                <Ionicons name="add-circle" size={18} color="#4ade80" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#333' : '#ddd' }]} placeholder={t.addProduct} placeholderTextColor="#666" value={itemName} onChangeText={setItemName} />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}><Ionicons name="add" size={30} color="#000" /></TouchableOpacity>
      </View>

      <FlatList
        data={currentList?.items || []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { backgroundColor: isDark ? '#111' : '#f9f9f9' }]}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }} onPress={() => item.completed ? toggleItem(listId, item.id) : openPriceModal(item.id)}>
              <Ionicons name={item.completed ? "checkbox" : "square-outline"} size={24} color="#4ade80" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemText, { color: isDark ? '#fff' : '#000', textDecorationLine: item.completed ? 'line-through' : 'none' }]}>{item.name}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {item.completed && <Text style={{ color: '#888', fontSize: 12 }}>{t.price || 'Ціна'}: {item.price} {listCurrency}</Text>}
                  {item.averageInterval > 0 && <Text style={{ color: '#4ade80', fontSize: 12 }}>⏱ {item.averageInterval} дн.</Text>}
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeletePress(item.id)} style={{ padding: 5 }}>
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={isPriceModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.enterPrice}</Text>
            <TextInput style={styles.modalInput} placeholder={`0.00 ${listCurrency}`} placeholderTextColor="#666" keyboardType="numeric" autoFocus value={tempPrice} onChangeText={setTempPrice} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPriceModalVisible(false)}><Text style={{ color: '#fff' }}>{t.cancel}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmPrice}><Text style={{ fontWeight: 'bold' }}>{t.done}</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={isDeleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: '#ff444433', borderWidth: 1 }]}>
            <Ionicons name="trash-outline" size={40} color="#ff4444" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>{lang === 'ua' ? 'Видалити товар?' : 'Delete item?'}</Text>
            <Text style={{ color: '#aaa', textAlign: 'center', marginBottom: 20 }}>
              {lang === 'ua' ? 'Цю дію не можна буде скасувати.' : 'This action cannot be undone.'}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={{ color: '#fff' }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#ff4444' }]} onPress={confirmDeletion}>
                <Text style={{ fontWeight: 'bold', color: '#fff' }}>{lang === 'ua' ? 'Видалити' : 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  listName: { fontSize: 24, fontWeight: 'bold' },
  categoryBadge: { backgroundColor: 'rgba(74, 222, 128, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4, alignSelf: 'flex-start' },
  categoryBadgeText: { color: '#4ade80', fontSize: 12, fontWeight: '600' },
  editBtn: { padding: 10, backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: 12 },
  budgetCard: { padding: 18, borderRadius: 15, marginBottom: 15 },
  spentText: { fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  inputRow: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 15 },
  addBtn: { backgroundColor: '#4ade80', padding: 10, borderRadius: 12, justifyContent: 'center' },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10, gap: 12 },
  itemText: { fontSize: 17 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 5 },
  recommendationContainer: { marginBottom: 20 },
  recScroll: { flexDirection: 'row' },
  recChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, gap: 6, borderWidth: 1, borderColor: '#4ade8033' },
  recText: { fontSize: 14, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1a1a1a', padding: 25, borderRadius: 24, width: '85%', alignItems: 'center' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { backgroundColor: '#333', color: '#fff', width: '100%', padding: 15, borderRadius: 10, fontSize: 18, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 15, width: '100%', justifyContent: 'center' },
  cancelBtn: { padding: 15, flex: 1, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#4ade80', paddingVertical: 15, borderRadius: 12, flex: 1, alignItems: 'center' }
});