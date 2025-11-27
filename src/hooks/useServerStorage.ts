import { useState, useEffect, useCallback } from "react";

export function useServerStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial value from server
    useEffect(() => {
        let isMounted = true;

        const fetchValue = async () => {
            try {
                const response = await fetch(`/api/storage?key=${encodeURIComponent(key)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.value !== null && isMounted) {
                        setStoredValue(data.value);
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch storage key "${key}":`, error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchValue();

        return () => {
            isMounted = false;
        };
    }, [key]);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to the server.
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            setStoredValue((prevValue) => {
                const valueToStore = value instanceof Function ? value(prevValue) : value;

                // Save to server
                fetch('/api/storage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ key, value: valueToStore }),
                }).catch(err => console.error(`Failed to save storage key "${key}":`, err));

                return valueToStore;
            });
        } catch (error) {
            console.error(`Error setting value for key "${key}":`, error);
        }
    }, [key]);

    return [storedValue, setValue, isLoading];
}
