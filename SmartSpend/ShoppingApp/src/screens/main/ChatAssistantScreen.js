import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useStore } from '../../store/useStore';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "ТВІЙ_API_KEY"; 
const genAI = new GoogleGenerativeAI(API_KEY);

export default function ChatAssistantScreen() {
  const { theme, lang, addList, user } = useStore();
  const isDark = theme === 'dark';
  const flatListRef = useRef();

  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: lang === 'ua' ? 'Привіт! Я Spendie. Я аналізую твої покупки, щоб ти нічого не забув. Напиши "Можливості", щоб дізнатись, що я вмію.' : 'Hi! I am Spendie. I analyze your purchases so you don\'t forget anything.', 
      isUser: false,
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleAIAction = (jsonResponse) => {
    try {
      const data = JSON.parse(jsonResponse);
      if (data.action === "CREATE_LIST") {
        addList(data.name, data.budget || 0, data.category || "Інше");
        return lang === 'ua' ? `Готово! Список "${data.name}" створено.` : `Done! List "${data.name}" created.`;
      }
      return data.answer || jsonResponse;
    } catch (_error) {
      return jsonResponse;
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg = { 
      id: Date.now().toString(), 
      text: inputText, 
      isUser: true, 
      createdAt: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        System: Твоє ім'я Spendie. Ти AI-помічник у SmartSpend.
        Користувач: ${user?.nickname}. Мова: ${lang}.
        Якщо користувач хоче створити список, поверни JSON: {"action": "CREATE_LIST", "name": "...", "budget": 0, "category": "..."}
        В інших випадках відповідай текстом.
        Запит: ${inputText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const finalAnswer = handleAIAction(text);

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: finalAnswer, 
        isUser: false, 
        createdAt: new Date().toISOString() 
      }]);
    } catch (_error) {
      setMessages(prev => [...prev, { 
        id: 'err', 
        text: "Error connecting to AI", 
        isUser: false, 
        createdAt: new Date().toISOString() 
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const renderItem = ({ item, index }) => {
    const messageDate = new Date(item.createdAt).toLocaleDateString();
    const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toLocaleDateString() : null;

    return (
      <View>
        {messageDate !== prevDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{messageDate}</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble, 
          item.isUser ? styles.userBubble : styles.aiBubble,
          { backgroundColor: item.isUser ? '#4ade80' : (isDark ? '#222' : '#f0f0f0') }
        ]}>
          <Text style={[styles.messageText, { color: item.isUser ? '#000' : (isDark ? '#fff' : '#000') }]}>
            {item.text}
          </Text>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {isTyping && <ActivityIndicator color="#4ade80" style={{ marginBottom: 10 }} />}

      <View style={[styles.inputContainer, { borderTopColor: isDark ? '#222' : '#eee' }]}>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#111' : '#f5f5f5', color: isDark ? '#fff' : '#000' }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dateSeparator: { alignSelf: 'center', marginVertical: 15, backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  dateText: { color: '#aaa', fontSize: 11, fontWeight: 'bold' },
  messageBubble: { padding: 12, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  messageText: { fontSize: 16 },
  timeText: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4, opacity: 0.5 },
  inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center', borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 25, paddingHorizontal: 15, height: 45, marginRight: 10 },
  sendBtn: { backgroundColor: '#4ade80', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' }
});