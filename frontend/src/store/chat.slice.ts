import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, Contact } from '../types';

interface ChatState {
  contacts: Contact[];
  currentChatUserId: number | null;
  messages: Record<number, ChatMessage[]>;
  unreadCount: number;
  typingUsers: Set<number>;
}

const initialState: ChatState = {
  contacts: [],
  currentChatUserId: null,
  messages: {},
  unreadCount: 0,
  typingUsers: new Set(),
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    setCurrentChatUserId: (state, action: PayloadAction<number | null>) => {
      state.currentChatUserId = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ userId: number; messages: ChatMessage[] }>) => {
      const { userId, messages } = action.payload;
      state.messages[userId] = messages;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const message = action.payload;
      const userId = message.from_user_id === state.currentChatUserId ? message.from_user_id : message.to_user_id;

      if (!state.messages[userId]) {
        state.messages[userId] = [];
      }
      state.messages[userId].push(message);
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const fromUserId = action.payload;
      if (state.messages[fromUserId]) {
        state.messages[fromUserId] = state.messages[fromUserId].map((msg) => ({
          ...msg,
          is_read: 1,
        }));
      }
      state.contacts = state.contacts.map((contact) =>
        contact.user_id === fromUserId ? { ...contact, unread_count: 0 } : contact
      );
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    setTyping: (state, action: PayloadAction<{ userId: number; isTyping: boolean }>) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers.add(userId);
      } else {
        state.typingUsers.delete(userId);
      }
    },
    clearCurrentChat: (state) => {
      state.currentChatUserId = null;
      state.messages = {};
    },
  },
});

export const {
  setContacts,
  setCurrentChatUserId,
  setMessages,
  addMessage,
  markAsRead,
  setUnreadCount,
  setTyping,
  clearCurrentChat,
} = chatSlice.actions;

export default chatSlice.reducer;
