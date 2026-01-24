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
            setStoredValue((current) => {
                const valueToStore = value instanceof Function ? value(current) : value;

                // Save to local storage
                if (typeof window !== "undefined") {
                    // Use setTimeout to avoid side effects during render/update cycle
                    // and to prevent synchronous updates in other components listening to the event
                    setTimeout(() => {
                        try {
                            window.localStorage.setItem(key, JSON.stringify(valueToStore));
                            // Dispatch custom event for same-window sync
                            window.dispatchEvent(new CustomEvent('local-storage-update', {
                                detail: { key, value: valueToStore }
                            }));
                        } catch (error) {
                            console.error(`Error saving to localStorage key "${key}":`, error);
                        }
                    }, 0);
                }

                return valueToStore;
            });

        } catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
        }
    }, [key]);

    return [storedValue, setValue, isLoading];
}
