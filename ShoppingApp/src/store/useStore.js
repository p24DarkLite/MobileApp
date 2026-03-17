import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null, 
      users: [], 
      theme: 'dark',
      shoppingLists: [],
      lang: 'ua', 
      currency: 'грн', 

      setCurrency: (currency) => set({ currency }),
      setLanguage: (lang) => set({ lang }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),

      updateUserProfile: (updatedData) => set((state) => ({
        user: { ...state.user, ...updatedData },
        users: state.users.map(u => u.email === state.user.email ? { ...u, ...updatedData } : u)
      })),

      registerUser: (newUser) => {
        const users = get().users;
        if (users.find(u => u.email === newUser.email)) return false;
        const userWithProfile = { 
          ...newUser, 
          nickname: newUser.nickname || newUser.name || newUser.email.split('@')[0], 
          photo: null 
        };
        set({ users: [...users, userWithProfile], user: userWithProfile });
        return true;
      },

      loginUser: (email, password) => {
        const found = get().users.find(u => u.email === email && u.password === password);
        if (found) { 
          const userWithNick = { 
            ...found, 
            nickname: found.nickname || found.email.split('@')[0] 
          };
          set({ user: userWithNick }); 
          return true; 
        }
        return false;
      },

      logout: () => set({ user: null }),

      addList: (name, budget, category, currency) => {
        const currentUser = get().user;
        // Перевірка, чи користувач залогінений
        if (!currentUser) return;

        set((state) => ({
          shoppingLists: [
            { 
              id: Date.now().toString(),
              ownerEmail: currentUser.email, // Прив'язка списку до Email власника
              name: name,
              budget: budget || 0,
              category: category,
              currency: currency || state.currency,
              createdAt: Date.now(),
              items: [] 
            }, 
            ...state.shoppingLists
          ]
        }));
      },

      deleteList: (id) => set((state) => ({
        shoppingLists: state.shoppingLists.filter(l => l.id !== id)
      })),

      updateListItems: (listId, newItems) => set((state) => ({
        shoppingLists: state.shoppingLists.map((list) =>
          list.id === listId ? { ...list, items: newItems } : list
        ),
      })),
    }),
    {
      name: 'shopping-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);