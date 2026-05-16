import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Keyboard, Platform } from 'react-native';
import { useStore } from '../../store/useStore';
import { translations } from '../../store/translation';
import { Ionicons } from '@expo/vector-icons';

export default function CreateListScreen({ navigation }) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('Інше');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [errors, setErrors] = useState({ name: '', budget: '' });
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  
  const { addList, theme, lang, currency, setCurrency, shoppingLists = [] } = useStore();

  const isDark = theme === 'dark';
  const t = translations[lang || 'ua'] || translations['ua'];

  const categories = [
    { id: '1', label: lang === 'ua' ? 'Їжа' : 'Food' },
    { id: '2', label: lang === 'ua' ? 'Одяг та взуття' : 'Clothes & Shoes' },
    { id: '3', label: lang === 'ua' ? 'Техніка' : 'Electronics' },
    { id: '4', label: lang === 'ua' ? 'Ліки' : 'Medicine' },
    { id: '5', label: lang === 'ua' ? 'Розваги' : 'Entertainment' },
    { id: '6', label: lang === 'ua' ? 'Спорт' : 'Sport' },
    { id: '7', label: lang === 'ua' ? 'Дім' : 'Home' },
    { id: '8', label: lang === 'ua' ? 'Інше' : 'Other' },
  ];

  const currencyList = [
    { id: 'uah', label: t.currencyLabels?.uah || 'UAH', symbol: '₴' },
    { id: 'usd', label: t.currencyLabels?.usd || 'USD', symbol: '$' },
    { id: 'eur', label: t.currencyLabels?.eur || 'EUR', symbol: '€' },
  ];

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
    setSelectedDate(newDate);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrors({ ...errors, name: lang === 'ua' ? 'Введіть назву' : 'Enter name' });
      return;
    }
    await addList(name, budget, category, currency);
    navigation.navigate('Lists');
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < offset; i++) days.push(<View key={`e-${i}`} style={styles.calEmpty} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const hasLists = shoppingLists.some(l => {
        const ld = l.createdAt?.seconds ? new Date(l.createdAt.seconds * 1000) : new Date(l.createdAt);
        return ld.toDateString() === date.toDateString();
      });

      days.push(
        <TouchableOpacity 
          key={d} 
          style={[styles.calDay, isSelected && { backgroundColor: '#4ade80' }]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[styles.calDayText, { color: isSelected ? '#000' : (isDark ? '#fff' : '#444') }]}>{d}</Text>
          {hasLists && <View style={[styles.calDot, { backgroundColor: isSelected ? '#000' : '#4ade80' }]} />}
        </TouchableOpacity>
      );
    }

    const selectedDayLists = shoppingLists.filter(l => {
      const ld = l.createdAt?.seconds ? new Date(l.createdAt.seconds * 1000) : new Date(l.createdAt);
      return ld.toDateString() === selectedDate.toDateString();
    });

    return (
      <View style={[styles.calContainer, { borderColor: isDark ? '#333' : '#eee' }]}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)}><Ionicons name="chevron-back" size={20} color="#4ade80" /></TouchableOpacity>
          <Text style={[styles.monthTitle, { color: isDark ? '#fff' : '#000' }]}>
            {selectedDate.toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-GB', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}><Ionicons name="chevron-forward" size={20} color="#4ade80" /></TouchableOpacity>
        </View>
        <View style={styles.calGrid}>{days}</View>
        <View style={[styles.eventList, { backgroundColor: isDark ? '#111' : '#f9f9f9' }]}>
          <Text style={styles.eventTitle}>{lang === 'ua' ? 'Списки:' : 'Lists:'}</Text>
          {selectedDayLists.length > 0 ? selectedDayLists.map((l, i) => (
            <Text key={i} style={{color: isDark ? '#fff' : '#000', fontSize: 11}}>• {l.name}</Text>
          )) : <Text style={{color: '#666', fontSize: 10}}>{lang === 'ua' ? 'Порожньо' : 'Empty'}</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>{t.createHeader}</Text>
        
        <Text style={styles.label}>{lang === 'ua' ? 'Назва' : 'Name'}</Text>
        <TextInput 
          style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#111' : '#f9f9f9' }]} 
          value={name} onChangeText={setName} placeholder={t.placeholder} placeholderTextColor="#666"
        />

        <View style={{ marginTop: 15 }}>
          <Text style={styles.label}>{lang === 'ua' ? 'Категорія' : 'Category'}</Text>
          <TouchableOpacity 
            style={[styles.input, styles.selector, { borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#111' : '#f9f9f9' }]}
            onPress={() => { setShowCategories(!showCategories); setShowCurrencies(false); Keyboard.dismiss(); }}
          >
            <Text style={{ color: isDark ? '#fff' : '#000' }}>{category}</Text>
            <Ionicons name="chevron-down" size={18} color="#4ade80" />
          </TouchableOpacity>
        </View>

        <View style={[styles.row, { marginTop: 15 }]}>
          <View style={{ flex: 0.6 }}>
            <Text style={styles.label}>{t.budget}</Text>
            <TextInput style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#111' : '#f9f9f9' }]} value={budget} onChangeText={setBudget} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
          </View>
          <View style={{ flex: 0.4, marginLeft: 10 }}>
            <Text style={styles.label}>{lang === 'ua' ? 'Валюта' : 'Currency'}</Text>
            <TouchableOpacity style={[styles.input, styles.selector, { borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#111' : '#f9f9f9' }]} onPress={() => { setShowCurrencies(!showCurrencies); setShowCategories(false); }}>
              <Text style={{ color: isDark ? '#fff' : '#000' }}>{currency}</Text>
              <Ionicons name="chevron-down" size={16} color="#4ade80" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.mainBtn} onPress={handleCreate}>
          <Text style={styles.mainBtnText}>{t.createBtn}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 20 }]}>{lang === 'ua' ? 'Графік' : 'Schedule'}</Text>
        {renderCalendar()}
      </ScrollView>

      {showCategories && (
        <View style={[styles.overlay, { backgroundColor: isDark ? '#1a1a1a' : '#fff', top: 212 }]}>
          <ScrollView nestedScrollEnabled>
            {categories.map((item) => (
              <TouchableOpacity key={item.id} style={styles.dropItem} onPress={() => { setCategory(item.label); setShowCategories(false); }}>
                <Text style={{ color: isDark ? '#fff' : '#000' }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {showCurrencies && (
        <View style={[styles.overlay, { backgroundColor: isDark ? '#1a1a1a' : '#fff', top: 295, width: '35%', left: '55%' }]}>
          {currencyList.map((item) => (
            <TouchableOpacity key={item.id} style={styles.dropItem} onPress={() => { setCurrency(item.symbol); setShowCurrencies(false); }}>
              <Text style={{ color: isDark ? '#fff' : '#000' }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginTop: Platform.OS === 'ios' ? 40 : 10, marginBottom: 15 },
  label: { color: '#4ade80', fontWeight: 'bold', marginBottom: 4, fontSize: 13 },
  input: { padding: 12, borderRadius: 10, borderWidth: 1, height: 48, justifyContent: 'center' },
  row: { flexDirection: 'row' },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainBtn: { backgroundColor: '#4ade80', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  mainBtnText: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  overlay: { position: 'absolute', left: 20, right: 20, maxHeight: 160, borderRadius: 10, borderWidth: 1, borderColor: '#4ade80', zIndex: 9999, elevation: 10 },
  dropItem: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  calContainer: { marginTop: 8, borderRadius: 12, overflow: 'hidden', borderWidth: 1, marginBottom: 50 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 },
  monthTitle: { fontWeight: 'bold', fontSize: 14, textTransform: 'capitalize' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 5 },
  calDay: { width: '13%', height: 30, margin: '0.6%', alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  calEmpty: { width: '13%', height: 30, margin: '0.6%' },
  calDayText: { fontSize: 12, fontWeight: 'bold' },
  calDot: { width: 3, height: 3, borderRadius: 1.5, marginTop: 1 },
  eventList: { padding: 8, borderTopWidth: 1, borderColor: '#333' },
  eventTitle: { color: '#4ade80', fontSize: 10, fontWeight: 'bold', marginBottom: 2 }
});