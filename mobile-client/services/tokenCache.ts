// service to store, retrieve and delete tokens from device secure storage rather than device memory
// - allows users to remain logged in between app reloads, and to keep their tokens secure

import * as SecureStore from 'expo-secure-store';

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => void;
}

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    return await SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, token: string) {
    return await SecureStore.setItemAsync(key, token);
  },
  clearToken(key: string) {
    SecureStore.deleteItemAsync(key);
  },
};
