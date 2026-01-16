import { useState, useEffect, useCallback } from "react";

export function useServerStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial value from server
    useEffect(() => {
        let isMounted = true;

        const fetchValue = async () => {
            try {
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                // Send demo user ID if configured (relaxed check to match EcosystemPage)
                // Send demo user ID if configured (relaxed check to match EcosystemPage)
                // Fix: Must match auth-helper logic (check enable flag, fallback to 'demo-user')
                if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                    headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
                }

                const response = await fetch(`/api/storage?key=${encodeURIComponent(key)}`, {
                    headers: headers
                });

                if (response.ok) {
                    const data = await response.json();
                    if (isMounted) {
                        setStoredValue(data.value ?? initialValue);
                    }
                } else {
                    console.warn(`[useServerStorage] Failed to fetch ${key}: ${response.status} ${response.statusText}`);
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
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
                    headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
                }

                fetch('/api/storage', {
                    method: 'POST',
                    headers: headers,
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
