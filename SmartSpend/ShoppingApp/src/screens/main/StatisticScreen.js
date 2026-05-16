import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useStore } from '../../store/useStore';
import { Ionicons } from '@expo/vector-icons';

export default function StatisticsScreen({ navigation }) {
  const { shoppingLists, theme, lang, currency, user } = useStore();
  const isDark = theme === 'dark';
  
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Їжа', 'Одяг та взуття', 'Техніка', 'Ліки', 'Розваги', 'Спорт', 'Дім', 'Інше'];

  const userLists = shoppingLists.filter(l => l.ownerEmail === user?.email);

  const filteredLists = filterCategory === 'All' 
    ? userLists 
    : userLists.filter(l => l.category === filterCategory);

  const totalSpent = filteredLists.reduce((sum, list) => {
    const listSum = list.items?.reduce((iSum, item) => iSum + (item.completed ? Number(item.price || 0) : 0), 0) || 0;
    return sum + listSum;
  }, 0);

  const totalBudget = filteredLists.reduce((sum, list) => sum + Number(list.budget || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
          {lang === 'ua' ? 'Статистика' : 'Statistics'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setFilterCategory(cat)}
              style={[styles.filterBtn, filterCategory === cat ? styles.filterBtnActive : { backgroundColor: isDark ? '#111' : '#f0f0f0', borderColor: isDark ? '#333' : '#ddd' }]}
            >
              <Text style={{ color: filterCategory === cat ? '#000' : (isDark ? '#fff' : '#666') }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.mainCard, { backgroundColor: isDark ? '#111' : '#f9f9f9' }]}>
          <View style={[styles.circleProgress, { borderColor: '#4ade80' }]}>
             <Text style={[styles.spentText, { color: '#4ade80' }]}>{Math.round(totalSpent)} {currency}</Text>
             <Text style={{ color: '#888', fontSize: 12 }}>{lang === 'ua' ? 'з' : 'of'} {Math.round(totalBudget)} {currency}</Text>
          </View>
          <Text style={{color: '#666', marginTop: 15}}>
            {lang === 'ua' ? 'Загальні витрати за фільтром' : 'Total spent by filter'}
          </Text>
        </View>

        <Text style={[styles.subTitle, { color: isDark ? '#fff' : '#000', marginTop: 10 }]}>
          {lang === 'ua' ? 'По категоріях' : 'By categories'}
        </Text>
        
        {categories.filter(c => c !== 'All').map(cat => {
          const catLists = userLists.filter(l => l.category === cat);
          const catSpent = catLists.reduce((sum, l) => sum + (l.items?.reduce((s, i) => s + (i.completed ? Number(i.price || 0) : 0), 0) || 0), 0);
          if (catSpent === 0 && filterCategory !== 'All') return null;

          return (
            <View key={cat} style={[styles.catRow, { backgroundColor: isDark ? '#111' : '#f9f9f9' }]}>
              <View style={styles.catInfo}>
                <Ionicons name="pie-chart" size={20} color="#4ade80" />
                <Text style={{ marginLeft: 10, color: isDark ? '#fff' : '#000' }}>{cat}</Text>
              </View>
              <Text style={styles.catSpentText}>{Math.round(catSpent)} {currency}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  filterBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  filterBtnActive: { backgroundColor: '#4ade80', borderColor: '#4ade80' },
  mainCard: { padding: 30, borderRadius: 25, alignItems: 'center', marginBottom: 25 },
  circleProgress: { width: 160, height: 160, borderRadius: 80, borderWidth: 10, justifyContent: 'center', alignItems: 'center' },
  spentText: { fontSize: 24, fontWeight: 'bold' },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 15, marginBottom: 10 },
  catInfo: { flexDirection: 'row', alignItems: 'center' },
  catSpentText: { fontWeight: 'bold', color: '#4ade80' }
});