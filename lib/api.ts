import { Platform, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production backend (Railway)
const PRODUCTION_API_URL = 'https://dreamliveapp-production.up.railway.app/api';

// API Configuration and utilities
const getApiBaseUrl = () => {
  const defaultUrl = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;

  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL_WEB || defaultUrl;
  }

  // Use platform-specific env vars if available, else use the global fallback/production URL
  const androidUrl = process.env.EXPO_PUBLIC_API_URL_ANDROID || defaultUrl;
  const iosUrl = process.env.EXPO_PUBLIC_API_URL_IOS || defaultUrl;

  return Platform.OS === 'android' ? androidUrl : iosUrl;
};

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private onTokenExpired?: () => void;
  private initPromise: Promise<void>;
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private CACHE_TTL = 30000; // 30 seconds for in-memory
  private PERSISTENT_CACHE_KEY = 'dream_live_api_cache';

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.initPromise = this.initAll();
  }

  /**
   * Optimizes Pexels image URLs to a smaller width for faster loading.
   */
  static optimizeImage(url: string | undefined, width: number = 400) {
    if (!url) return 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400';
    if (url.includes('pexels.com')) {
      return url.replace(/w=\d+/, `w=${width}`).replace(/&w=\d+/, `&w=${width}`);
    }
    return url;
  }

  /**
   * Prefetches images to speed up UI rendering
   */
  static async prefetchImages(urls: (string | undefined)[]) {
    const validUrls = urls.filter(url => !!url) as string[];
    return Promise.all(validUrls.map(url => Image.prefetch(this.optimizeImage(url))));
  }

  private async initAll() {
    await Promise.all([
      this.initToken(),
      this.loadPersistentCache()
    ]);
  }

  private async initToken() {
    try {
      if (Platform.OS !== 'web') {
        this.token = await SecureStore.getItemAsync('auth_token');
      } else {
        this.token = localStorage.getItem('auth_token');
      }
      console.log('🔑 Token initialized:', this.token ? '✅ Found' : '❌ Not found');
    } catch (e) {
      console.error('Failed to load token', e);
    }
  }

  private async loadPersistentCache() {
    try {
      const stored = await AsyncStorage.getItem(this.PERSISTENT_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          this.cache.set(key, value);
        });
        console.log('💾 Persistent cache loaded');
      }
    } catch (e) {
      console.warn('Failed to load persistent cache', e);
    }
  }

  private async savePersistentCache() {
    try {
      const obj = Object.fromEntries(this.cache.entries());
      await AsyncStorage.setItem(this.PERSISTENT_CACHE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save persistent cache', e);
    }
  }

  async getToken() {
    await this.initPromise;
    return this.token;
  }

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  setToken(token: string | null) {
    this.token = token;
    this.cache.clear();
    AsyncStorage.removeItem(this.PERSISTENT_CACHE_KEY);
    
    if (token) {
      if (Platform.OS !== 'web') {
        SecureStore.setItemAsync('auth_token', token);
      } else {
        localStorage.setItem('auth_token', token);
      }
    } else {
      if (Platform.OS !== 'web') {
        SecureStore.deleteItemAsync('auth_token');
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  setOnTokenExpired(callback: () => void) {
    this.onTokenExpired = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}`;

    // 1. Check Cache
    if (useCache && (options.method === 'GET' || !options.method)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < this.CACHE_TTL) {
          console.log(`⚡ Serving from Fresh Cache: ${url}`);
          return { data: cached.data, status: 200 };
        } else {
          console.log(`⏳ Serving from Stale Cache (revalidating): ${url}`);
          this.backgroundFetch<T>(endpoint, options, cacheKey);
          return { data: cached.data, status: 200 };
        }
      }
    }

    const controller = new AbortController();
    // Render free-tier backends can take up to 50 seconds to wake up from a cold start.
    // Increasing timeout to 60s to prevent initial connection errors after installation.
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      };

      const start = Date.now();
      console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, config).catch(e => {
        if (e.name === 'AbortError') throw new Error('Request timed out');
        throw e;
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - start;
      console.log(`✅ API Response: ${url} (${duration}ms)`);

      if (response.status === 401 && this.onTokenExpired) {
        this.onTokenExpired();
      }

      const textData = await response.text();
      let jsonData;
      try {
        jsonData = textData ? JSON.parse(textData) : {};
      } catch (parseError) {
        return { error: 'An unexpected server error occurred.', status: response.status };
      }

      if (!response.ok) {
        return { error: jsonData.error || `HTTP Error ${response.status}`, status: response.status };
      }

      // Save to Cache
      if (useCache && (options.method === 'GET' || !options.method)) {
        this.cache.set(cacheKey, { data: jsonData, timestamp: Date.now() });
        this.savePersistentCache();
      }

      return { data: jsonData, status: response.status };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`📡 Network failed, serving Stale Cache: ${url}`);
        return { data: cached.data, status: 200 };
      }

      return {
        error: error.message === 'Request timed out' ? 'Connection timed out.' : 'Network error.',
        status: 0,
      };
    }
  }

  private async backgroundFetch<T>(endpoint: string, options: RequestInit, cacheKey: string) {
    try {
      const response = await this.request<T>(endpoint, { ...options, headers: { ...options.headers, 'X-Background-Fetch': 'true' } }, false);
      if (response.data) {
        this.cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        this.savePersistentCache();
      }
    } catch (e) {}
  }

  // Auth API
  async login(credentials: any) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    this.setToken(null);
  }

  // Health Check
  async healthCheck() {
    return this.request<any>('/health');
  }

  // Matches API
  async getMatches() {
    return this.request<any[]>('/matches', {}, true);
  }

  async getMatch(id: string) {
    return this.request<any>(`/matches/${id}`);
  }

  async createMatch(data: any) {
    return this.request<any>('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMatch(id: string, data: any) {
    return this.request<any>(`/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMatch(id: string) {
    return this.request<any>(`/matches/${id}`, {
      method: 'DELETE',
    });
  }

  // Leagues API
  async getLeagues() {
    return this.request<any[]>('/leagues', {}, true);
  }

  async getLeague(id: string) {
    return this.request<any>(`/leagues/${id}`);
  }

  async getLeagueMatches(id: string) {
    return this.request<any>(`/leagues/${id}/matches`);
  }

  async createLeague(data: any) {
    return this.request<any>('/leagues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeague(id: string, data: any) {
    return this.request<any>(`/leagues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLeague(id: string) {
    return this.request<any>(`/leagues/${id}`, {
      method: 'DELETE',
    });
  }

  // Videos API
  async getVideos() {
    return this.request<any[]>('/videos', {}, true);
  }

  async getVideo(id: string) {
    return this.request<any>(`/videos/${id}`);
  }

  async createVideo(data: any) {
    return this.request<any>('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVideo(id: string, data: any) {
    return this.request<any>(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVideo(id: string) {
    return this.request<any>(`/videos/${id}`, {
      method: 'DELETE',
    });
  }

  // Highlights API
  async getHighlights() {
    return this.request<any[]>('/highlights', {}, true);
  }

  async getHighlight(id: string) {
    return this.request<any>(`/highlights/${id}`);
  }

  async createHighlight(data: any) {
    return this.request<any>('/highlights', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHighlight(id: string, data: any) {
    return this.request<any>(`/highlights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHighlight(id: string) {
    return this.request<any>(`/highlights/${id}`, {
      method: 'DELETE',
    });
  }

  // Featured Content API
  async getFeaturedVideo() {
    return this.request<any>('/featured-video');
  }

  async updateFeaturedVideo(data: any) {
    return this.request<any>('/featured-video', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin API
  async getAdminStats() {
    return this.request<any>('/admin/stats');
  }
}

export const apiClient = new ApiClient();
export default apiClient;