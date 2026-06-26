import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import io, { Socket } from 'socket.io-client';

interface UpdateEvent {
  type: 'match' | 'league' | 'video' | 'highlight' | 'featured';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

// Production backend (Railway)
const PRODUCTION_API_URL = 'https://dreamliveapp-production.up.railway.app/api';

// Get the base URL for Socket.IO (without /api)
const getSocketUrl = () => {
  const defaultUrl = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;

  let apiUrl = defaultUrl;
  if (Platform.OS === 'web') {
    apiUrl = process.env.EXPO_PUBLIC_API_URL_WEB || defaultUrl;
  } else if (Platform.OS === 'android') {
    apiUrl = process.env.EXPO_PUBLIC_API_URL_ANDROID || defaultUrl;
  } else {
    apiUrl = process.env.EXPO_PUBLIC_API_URL_IOS || defaultUrl;
  }

  // Remove the '/api' suffix if it exists to get the socket server root
  return apiUrl.replace(/\/api$/, '');
};

const SOCKET_URL = getSocketUrl();

class RealTimeManager {
  private socket: any = null;
  private listeners: { [key: string]: Function[] } = {};

  constructor() {
    this.init();
  }

  private init() {
    console.log('🔌 Initializing Socket.IO connection to:', SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Dream Live Socket Server');
    });

    this.socket.on('dreamlive-update', (event: UpdateEvent) => {
      console.log('📡 Received real-time update:', event.type, event.action);
      this.emit('dreamlive-update', event);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket Server');
    });

    this.socket.on('connect_error', (error: any) => {
      console.warn('❌ Socket connection error:', error.message);
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

// Global instance
const realTimeManager = new RealTimeManager();

export function useRealTimeUpdates() {
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const subscribeToUpdates = useCallback((callback: (event: UpdateEvent) => void) => {
    realTimeManager.on('dreamlive-update', callback);
    return () => realTimeManager.off('dreamlive-update', callback);
  }, []);

  const triggerUpdate = useCallback((event: UpdateEvent) => {
    // This is primarily handled by the server now, but kept for UI feedback if needed
    setLastUpdate(Date.now());
  }, []);

  return {
    lastUpdate,
    triggerUpdate,
    subscribeToUpdates
  };
}

export function useAutoRefresh(refreshCallback: () => Promise<void>, dependencies: any[] = []) {
  const { subscribeToUpdates } = useRealTimeUpdates();

  useEffect(() => {
    const unsubscribe = subscribeToUpdates(async (event) => {
      console.log('🔄 Auto-refreshing UI due to server update:', event.type, event.action);
      try {
        await refreshCallback();
      } catch (error) {
        console.error('❌ Error during auto-refresh:', error);
      }
    });

    return unsubscribe;
  }, dependencies);
}