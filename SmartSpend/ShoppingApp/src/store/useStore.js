import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const calculateInterval = (history) => {
  if (!history || history.length < 2) return 0;
  let totalDays = 0;
  for (let i = 1; i < history.length; i++) {
    const diff = new Date(history[i]) - new Date(history[i - 1]);
    totalDays += diff / (1000 * 60 * 60 * 24);
  }
  return Math.round(totalDays / (history.length - 1));
};

export const useStore = create(
  persist(
    (set, get) => ({
      user: null, 
      theme: 'dark',
      shoppingLists: [],
      lang: 'ua', 
      currency: 'грн', 
      confirmDelete: true,
      isLoading: false,

      setConfirmDelete: (val) => set({ confirmDelete: val }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (lang) => set({ lang }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),

      registerUser: async (newUser) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
          const firebaseUser = userCredential.user;
          const userWithProfile = { 
            uid: firebaseUser.uid,
            email: firebaseUser.email, 
            nickname: newUser.nickname || firebaseUser.email.split('@')[0], 
          };
          set({ user: userWithProfile });
          return true;
        } catch (error) {
          console.error("Помилка реєстрації:", error.message);
          return false;
        }
      },

      loginUser: async (email, password) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          const userData = { 
            uid: firebaseUser.uid, 
            email: firebaseUser.email,
            nickname: firebaseUser.email.split('@')[0] 
          };
          set({ user: userData });
          await get().fetchLists();
          return true;
        } catch (error) {
          console.error("Помилка входу:", error.message);
          return false;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, shoppingLists: [] });
        } catch (error) {
          console.error("Помилка виходу:", error);
        }
      },

      fetchLists: async () => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ isLoading: true });
        try {
          const q = query(collection(db, "lists"), where("userId", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          const lists = [];
          querySnapshot.forEach((docSnap) => {
            lists.push({ id: docSnap.id, ...docSnap.data() });
          });
          set({ shoppingLists: lists, isLoading: false });
        } catch (error) {
          console.error("Помилка завантаження:", error);
          set({ isLoading: false });
        }
      },

      addList: async (name, budget, category, currency) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const newList = { 
          userId: currentUser.uid,
          ownerEmail: currentUser.email,
          name: name,
          budget: Number(budget) || 0,
          category: category,
          currency: currency || get().currency,
          createdAt: Date.now(),
          items: [] 
        };

        try {
          const docRef = await addDoc(collection(db, "lists"), newList);
          set((state) => ({
            shoppingLists: [{ id: docRef.id, ...newList }, ...state.shoppingLists]
          }));
        } catch (error) {
          console.error("Помилка додавання:", error);
        }
      },

      deleteList: async (id) => {
        try {
          await deleteDoc(doc(db, "lists", id));
          set((state) => ({
            shoppingLists: state.shoppingLists.filter(l => l.id !== id)
          }));
        } catch (error) {
          console.error("Помилка видалення:", error);
        }
      },

      addItem: async (listId, itemName) => {
        const list = get().shoppingLists.find(l => l.id === listId);
        if (!list) return;

        const newItem = {
          id: Date.now().toString(),
          name: itemName,
          completed: false,
          price: 0,
          purchaseHistory: [],
          averageInterval: 0,
          nextDate: null
        };

        const updatedItems = [newItem, ...list.items];
        try {
          await updateDoc(doc(db, "lists", listId), { items: updatedItems });
          set((state) => ({
            shoppingLists: state.shoppingLists.map(l => l.id === listId ? { ...l, items: updatedItems } : l)
          }));
        } catch (error) {
          console.error("Помилка додавання товару:", error);
        }
      },

      toggleItem: async (listId, itemId, itemPrice = 0) => {
        const list = get().shoppingLists.find(l => l.id === listId);
        if (!list) return;

        const updatedItems = list.items.map((item) => {
          if (item.id !== itemId) return item;
          const isCompleting = !item.completed;
          let history = [...(item.purchaseHistory || [])];
          let avg = item.averageInterval || 0;
          let next = item.nextDate || null;

          if (isCompleting) {
            const now = new Date().toISOString();
            history.push(now);
            if (history.length > 5) history.shift();
            avg = calculateInterval(history) || 1;
            const nextD = new Date();
            nextD.setDate(nextD.getDate() + avg);
            next = nextD.toISOString();
          }

          return { 
            ...item, 
            completed: isCompleting,
            price: isCompleting ? Number(itemPrice) : 0,
            purchaseHistory: history,
            averageInterval: avg,
            nextDate: next
          };
        });

        try {
          await updateDoc(doc(db, "lists", listId), { items: updatedItems });
          set((state) => ({
            shoppingLists: state.shoppingLists.map(l => l.id === listId ? { ...l, items: updatedItems } : l)
          }));
        } catch (error) {
          console.error("Помилка оновлення статусу:", error);
        }
      },

      deleteItem: async (listId, itemId) => {
        const list = get().shoppingLists.find(l => l.id === listId);
        if (!list) return;
        const updatedItems = list.items.filter(item => item.id !== itemId);
        try {
          await updateDoc(doc(db, "lists", listId), { items: updatedItems });
          set((state) => ({
            shoppingLists: state.shoppingLists.map(l => l.id === listId ? { ...l, items: updatedItems } : l)
          }));
        } catch (error) {
          console.error("Помилка видалення товару:", error);
        }
      }
    }),
    {
      name: 'shopping-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);