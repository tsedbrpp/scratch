import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize from localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window === "undefined") {
            setIsLoading(false);
            return;
        }

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            } else {
                // If not found, persist the initial value? 
                // No, just keep the state as initialValue, don't write to LS yet to avoid side effects
            }
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
        } finally {
            setIsLoading(false);
        }
    }, [key]);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    // Listen for changes from other components/tabs
    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleStorageChange = (e: StorageEvent | CustomEvent) => {
            // Handle CustomEvent (same window)
            if (e instanceof CustomEvent && e.detail?.key === key) {
                setStoredValue(e.detail.value);
            }
            // Handle StorageEvent (other tabs)
            else if (e instanceof StorageEvent && e.key === key && e.newValue) {
                setStoredValue(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('local-storage-update', handleStorageChange as EventListener);
        window.addEventListener('storage', handleStorageChange as EventListener);

        return () => {
            window.removeEventListener('local-storage-update', handleStorageChange as EventListener);
            window.removeEventListener('storage', handleStorageChange as EventListener);
        };
    }, [key]);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            // Note: we can't use the previous 'storedValue' from closure if we want latest, 
            // but for now we rely on the dependency array or functional update.
            // Using functional update with setState is safer.

            // We need to calculate the new value to save it to LS
            // This is slightly tricky with functional updates if we don't have access to current state in this scope cleanly without dependency
            // But we can just use the value as is if it's not a function for simplicity in this fix, 
            // or better, pass it to setStoredValue first.

            setStoredValue((current) => {
                const valueToStore = value instanceof Function ? value(current) : value;

                // Save to local storage
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                    // Dispatch custom event for same-window sync
                    window.dispatchEvent(new CustomEvent('local-storage-update', {
                        detail: { key, value: valueToStore }
                    }));
                }

                return valueToStore;
            });

        } catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
        }
    }, [key]);

    return [storedValue, setValue, isLoading];
}
