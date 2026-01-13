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
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue, isLoading];
}
