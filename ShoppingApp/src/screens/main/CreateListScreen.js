import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Keyboard
} from 'react-native';
import { useStore } from '../../store/useStore';
import { translations } from '../../store/translation';
import { Ionicons } from '@expo/vector-icons';

export default function CreateListScreen({ navigation }) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('Інше');
  const [errors, setErrors] = useState({ name: '', budget: '' });
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const { addList, theme, lang, currency, setCurrency } = useStore();
  const isDark = theme === 'dark';
  const t = translations[lang || 'ua'];

  const categories = [
    { id: '1', label: lang === 'ua' ? 'Їжа' : 'Food' },
    { id: '2', label: lang === 'ua' ? 'Одяг' : 'Clothes' },
    { id: '3', label: lang === 'ua' ? 'Техніка' : 'Electronics' },
    { id: '4', label: lang === 'ua' ? 'Інше' : 'Other' },
  ];

  const currencyList = [
    { id: 'uah', label: t.currencyLabels.uah, symbol: '₴' },
    { id: 'usd', label: t.currencyLabels.usd, symbol: '$' },
    { id: 'eur', label: t.currencyLabels.eur, symbol: '€' },
  ];

  const handleCreate = () => {
    let hasError = false;
    let newErrors = { name: '', budget: '' };

    if (!name.trim()) {
      newErrors.name = lang === 'ua' ? 'Введіть назву списку' : 'Enter list name';
      hasError = true;
    }

    if (budget && isNaN(budget)) {
      newErrors.budget = lang === 'ua' ? 'Введіть число' : 'Enter a number';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    addList(name, budget, category, currency); 
    setName(''); 
    setBudget('');
    setErrors({ name: '', budget: '' });
    navigation.navigate('Lists');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>
        {t.createHeader}
      </Text>
      
      <Text style={styles.label}>{lang === 'ua' ? 'Назва' : 'Name'}</Text>
      <TextInput 
        style={[
          styles.input, 
          { 
            color: isDark ? '#fff' : '#000', 
            borderColor: errors.name ? '#ff4444' : (isDark ? '#333' : '#ddd'), 
            backgroundColor: isDark ? '#111' : '#f9f9f9' 
          }
        ]} 
        value={name} 
        onChangeText={(val) => {
          setName(val);
          if (errors.name) setErrors({...errors, name: ''});
        }} 
        placeholder={t.placeholder} 
        placeholderTextColor="#666"
      />
      {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

      <View style={{ zIndex: 2000 }}>
        <Text style={styles.label}>{lang === 'ua' ? 'Категорія' : 'Category'}</Text>
        <TouchableOpacity 
          style={[
            styles.input, 
            styles.selector, 
            { borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#111' : '#f9f9f9' }
          ]}
          onPress={() => { 
            setShowCategories(!showCategories); 
            setShowCurrencies(false); 
            Keyboard.dismiss(); 
          }}
        >
          <Text style={{ color: isDark ? '#fff' : '#000' }}>{category}</Text>
          <Ionicons name={showCategories ? "chevron-up" : "chevron-down"} size={18} color="#4ade80" />
        </TouchableOpacity>

        {showCategories && (
          <View style={[styles.dropdown, { backgroundColor: isDark ? '#222' : '#fff', borderColor: isDark ? '#444' : '#ddd' }]}>
            {categories.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.dropdownItem} 
                onPress={() => { setCategory(item.label); setShowCategories(false); }}
              >
                <Text style={{ color: isDark ? '#fff' : '#000' }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={[styles.row, { zIndex: 1000 }]}>
        <View style={{ flex: 0.6 }}>
          <Text style={styles.label}>{t.budget} ({currency})</Text>
          <TextInput 
            style={[
              styles.input, 
              { 
                color: isDark ? '#fff' : '#000', 
                borderColor: errors.budget ? '#ff4444' : (isDark ? '#333' : '#ddd'), 
                backgroundColor: isDark ? '#111' : '#f9f9f9' 
              }
            ]} 
            value={budget} 
            onChangeText={(val) => {
              setBudget(val);
              if (errors.budget) setErrors({...errors, budget: ''});
            }} 
            keyboardType="numeric" 
            placeholder="1000" 
            placeholderTextColor="#666"
          />
          {errors.budget ? <Text style={styles.errorText}>{errors.budget}</Text> : null}
        </View>

        <View style={{ flex: 0.4, marginLeft: 15 }}>
          <Text style={styles.label}>{lang === 'ua' ? 'Валюта' : 'Currency'}</Text>
          <TouchableOpacity 
            style={[
              styles.input, 
              styles.selector, 
              { borderColor: isDark ? '#333' : '#ddd', backgroundColor: isDark ? '#111' : '#f9f9f9' }
            ]}
            onPress={() => { 
              setShowCurrencies(!showCurrencies); 
              setShowCategories(false); 
              Keyboard.dismiss(); 
            }}
          >
            <Text style={{ color: isDark ? '#fff' : '#000' }}>{currency}</Text>
            <Ionicons name={showCurrencies ? "chevron-up" : "chevron-down"} size={18} color="#4ade80" />
          </TouchableOpacity>

          {showCurrencies && (
            <View style={[styles.dropdown, { backgroundColor: isDark ? '#222' : '#fff', borderColor: isDark ? '#444' : '#ddd' }]}>
              {currencyList.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.dropdownItem} 
                  onPress={() => { 
                    if (typeof setCurrency === 'function') {
                      setCurrency(item.symbol); 
                    }
                    setShowCurrencies(false); 
                  }}
                >
                  <Text style={{ color: isDark ? '#fff' : '#000' }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={handleCreate}>
        <Text style={styles.mainBtnText}>{t.createBtn}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
  label: { color: '#4ade80', fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { padding: 15, borderRadius: 12, borderWidth: 1, height: 55, justifyContent: 'center' },
  errorText: { color: '#ff4444', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 5 },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 5,
    zIndex: 5000,
  },
  dropdownItem: { padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#444' },
  mainBtn: { backgroundColor: '#4ade80', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 35 },
  mainBtnText: { fontWeight: 'bold', fontSize: 18, color: '#000' }
});