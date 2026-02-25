import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from './index';
import {
  addMessage,
  markAsRead,
  setUnreadCount,
  setTyping,
} from '../store/chat.slice';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    socketRef.current = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('message:receive', (message) => {
      dispatch(addMessage(message));
    });

    socket.on('message:read', (data) => {
      dispatch(markAsRead(data.to_user_id));
    });

    socket.on('chat:unread', (data: { count: number }) => {
      dispatch(setUnreadCount(data.count));
    });

    socket.on('typing:notify', (data: { user_id: number; is_typing: boolean }) => {
      dispatch(setTyping({ userId: data.user_id, isTyping: data.is_typing }));
    });

    socket.on('user:online', (data: { userId: number }) => {
      console.log('User online:', data.userId);
    });

    socket.on('user:offline', (data: { userId: number }) => {
      console.log('User offline:', data.userId);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, dispatch]);

  const sendMessage = useCallback(
    (toUserId: number, content: string, messageType = 1, orderId?: number) => {
      if (socketRef.current) {
        socketRef.current.emit('message:send', {
          to_user_id: toUserId,
          content,
          message_type: messageType,
          order_id: orderId,
        });
      }
    },
    []
  );

  const markAsReadWs = useCallback(
    (fromUserId: number) => {
      if (socketRef.current) {
        socketRef.current.emit('message:read', { from_user_id: fromUserId });
      }
    },
    []
  );

  const setTypingWs = useCallback(
    (toUserId: number, isTyping: boolean) => {
      if (socketRef.current) {
        socketRef.current.emit(isTyping ? 'typing:start' : 'typing:stop', { to_user_id: toUserId });
      }
    },
    []
  );

  return {
    sendMessage,
    markAsRead: markAsReadWs,
    setTyping: setTypingWs,
    isConnected: socketRef.current?.connected || false,
  };
};
