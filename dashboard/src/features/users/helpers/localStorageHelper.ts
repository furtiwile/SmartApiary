export const LocalStorage = {
  save(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    }
    catch (error) {
      console.error(`ERR: Could not save '${value}' into ${key} inside local storage.\nError: ${error}`);
      return false;
    }
  },



  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    }
    catch (error) {
      console.error(`ERR: Could not get value from ${key} inside local storage.\nError: ${error}`);
      return null;
    }
  },



  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    }
    catch (error) {
      console.error(`ERR: Could not remove ${key} from local storage.\nError: ${error}`);
      return false;
    }
  }
} as const;
