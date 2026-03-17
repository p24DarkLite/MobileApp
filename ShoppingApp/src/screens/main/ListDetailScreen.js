import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useStore } from '../../store/useStore';
import { translations } from '../../store/translation'; 
import { Ionicons } from '@expo/vector-icons';

export default function ListDetailScreen({ route }) {
  const { listId } = route.params;
  const { shoppingLists, updateListItems, theme, lang } = useStore(); 
  const isDark = theme === 'dark';
  const t = translations[lang || 'ua']; 
  const currentList = shoppingLists.find(l => l.id === listId);
  const [itemName, setItemName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const listCurrency = currentList?.currency || 'грн';
  const budget = Number(currentList?.budget) || 0;
  const totalSpent = currentList?.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0;
  const isOverBudget = totalSpent > budget;

  const addItem = () => {
    if (!itemName.trim()) return;
    const newItem = { 
      id: Date.now().toString(), 
      name: itemName, 
      completed: false, 
      price: 0 
    };
    updateListItems(listId, [...currentList.items, newItem]);
    setItemName('');
  };

  const openPriceModal = (id) => {
    setSelectedItemId(id);
    setTempPrice('');
    setModalVisible(true);
  };

  const confirmPrice = () => {
    const updated = currentList.items.map(item => 
      item.id === selectedItemId ? { ...item, completed: true, price: Number(tempPrice) || 0 } : item
    );
    updateListItems(listId, updated);
    setModalVisible(false);
  };

  const toggleOff = (id) => {
    const updated = currentList.items.map(item => 
      item.id === id ? { ...item, completed: false, price: 0 } : item
    );
    updateListItems(listId, updated);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>

      <View style={[
        styles.budgetCard, 
        { backgroundColor: isOverBudget ? (isDark ? '#441111' : '#ffebee') : (isDark ? '#111' : '#f4f4f4') }
      ]}>

        <Text style={{ color: isDark ? '#aaa' : '#666' }}>{t.budget}: {budget} {listCurrency}</Text>
        <Text style={[styles.spentText, { color: isOverBudget ? '#ff4444' : '#4ade80' }]}>
          {t.spent}: {totalSpent} {listCurrency}
        </Text>
        {isOverBudget && (
          <Text style={{color: '#ff4444', fontSize: 12, marginTop: 4}}>
            {t.overBudget}: {totalSpent - budget} {listCurrency}
          </Text>
        )}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#333' : '#ddd' }]}
          placeholder={t.addProduct}
          placeholderTextColor="#666"
          value={itemName}
          onChangeText={setItemName}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Ionicons name="add" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentList?.items || []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.itemCard, { backgroundColor: isDark ? '#111' : '#f9f9f9' }]} 
            onPress={() => item.completed ? toggleOff(item.id) : openPriceModal(item.id)}
          >
            <Ionicons 
              name={item.completed ? "checkbox" : "square-outline"} 
              size={24} 
              color="#4ade80" 
            />
            <View style={{ flex: 1 }}>
              <Text style={[
                styles.itemText, 
                { color: isDark ? '#fff' : '#000', textDecorationLine: item.completed ? 'line-through' : 'none' }
              ]}>
                {item.name}
              </Text>
              {item.completed && (
                <Text style={{ color: '#888', fontSize: 12 }}>
                  {/* Замінено грн на listCurrency */}
                  {t.price || 'Price'}: {item.price} {listCurrency}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>{t.enterPrice}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={`0.00 ${listCurrency}`} 
              placeholderTextColor="#666"
              keyboardType="numeric"
              autoFocus
              value={tempPrice}
              onChangeText={setTempPrice}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#fff' }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmPrice}>
                <Text style={{ fontWeight: 'bold' }}>{t.done}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  budgetCard: { padding: 18, borderRadius: 15, marginBottom: 20 },
  spentText: { fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  inputRow: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 15 },
  addBtn: { backgroundColor: '#4ade80', padding: 10, borderRadius: 12, justifyContent: 'center' },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10, gap: 12 },
  itemText: { fontSize: 17 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222', padding: 25, borderRadius: 20, width: '80%', alignItems: 'center' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalInput: { backgroundColor: '#333', color: '#fff', width: '100%', padding: 15, borderRadius: 10, fontSize: 18, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', marginTop: 25, gap: 15 },
  cancelBtn: { padding: 15 },
  confirmBtn: { backgroundColor: '#4ade80', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10 }
});