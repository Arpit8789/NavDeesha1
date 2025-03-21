// js/utils/storage.js

class StorageService {
    constructor() {
      this.storage = window.localStorage;
      this.memoryStorage = new Map();
      this.useMemory = false;
      
      try {
        this.storage.setItem('test', 'test');
        this.storage.removeItem('test');
      } catch (e) {
        console.warn('LocalStorage not available, falling back to memory storage');
        this.useMemory = true;
      }
    }
  
    set(key, value, expiryInSeconds = null) {
      const item = {
        value,
        expires: expiryInSeconds ? Date.now() + (expiryInSeconds * 1000) : null
      };
      
      const serialized = JSON.stringify(item);
      
      if (this.useMemory) {
        this.memoryStorage.set(key, serialized);
      } else {
        try {
          this.storage.setItem(key, serialized);
        } catch (e) {
          console.error('Error saving to localStorage:', e);
          // Fall back to memory storage
          this.memoryStorage.set(key, serialized);
        }
      }
    }
  
    get(key) {
      let serialized;
      
      if (this.useMemory) {
        serialized = this.memoryStorage.get(key);
      } else {
        serialized = this.storage.getItem(key);
      }
      
      if (!serialized) return null;
      
      try {
        const item = JSON.parse(serialized);
        
        // Check if item has expired
        if (item.expires && Date.now() > item.expires) {
          this.remove(key);
          return null;
        }
        
        return item.value;
      } catch (e) {
        console.error('Error parsing stored item:', e);
        return null;
      }
    }
  
    remove(key) {
      if (this.useMemory) {
        this.memoryStorage.delete(key);
      } else {
        this.storage.removeItem(key);
      }
    }
  
    clear() {
      if (this.useMemory) {
        this.memoryStorage.clear();
      } else {
        this.storage.clear();
      }
    }
  
    getAllKeys() {
      if (this.useMemory) {
        return Array.from(this.memoryStorage.keys());
      } else {
        return Object.keys(this.storage);
      }
    }
  
    // Utility method to get all items that match a prefix
    getByPrefix(prefix) {
      const items = {};
      const keys = this.getAllKeys();
      
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          items[key] = this.get(key);
        }
      });
      
      return items;
    }
  
    // Utility method to remove all expired items
    cleanupExpired() {
      const keys = this.getAllKeys();
      
      keys.forEach(key => {
        let serialized;
        
        if (this.useMemory) {
          serialized = this.memoryStorage.get(key);
        } else {
          serialized = this.storage.getItem(key);
        }
        
        if (serialized) {
          try {
            const item = JSON.parse(serialized);
            if (item.expires && Date.now() > item.expires) {
              this.remove(key);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      });
    }
  
    // Get storage usage in bytes (approximate for localStorage)
    getUsage() {
      if (this.useMemory) {
        let usage = 0;
        this.memoryStorage.forEach((value) => {
          usage += (value.length * 2); // UTF-16 characters are 2 bytes each
        });
        return usage;
      } else {
        let usage = 0;
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          const value = this.storage.getItem(key);
          usage += (key.length + value.length) * 2; // UTF-16 characters are 2 bytes each
        }
        return usage;
      }
    }
  
    // Check if we're close to the storage limit
    isStorageAlmostFull() {
      if (this.useMemory) return false;
      
      // Assume 5MB limit for localStorage (common browser limit)
      const MAX_SIZE = 5 * 1024 * 1024;
      const WARNING_THRESHOLD = 0.9; // 90% full
      
      return this.getUsage() > (MAX_SIZE * WARNING_THRESHOLD);
    }
  }
  
  export const storage = new StorageService();
  