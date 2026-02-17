import { useState, useEffect, useCallback } from "react";
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { useDemoMode } from '@/hooks/useDemoMode'; // [Fix] Import hook

export function useServerStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
    const { currentWorkspaceId } = useWorkspace();
    const { isReadOnly } = useDemoMode(); // [Fix] Check read-only status
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState(true);

    const getHeaders = useCallback((base: HeadersInit = {}) => {
        const headers = { ...base } as Record<string, string>;
        if (currentWorkspaceId) {
            headers['x-workspace-id'] = currentWorkspaceId;
        }
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
        }
        return headers;
    }, [currentWorkspaceId]);

    // Fetch initial value from server
    useEffect(() => {
        let isMounted = true;

        const fetchValue = async () => {
            // console.log(`[useServerStorage] Fetching key: "${key}" for workspace: ${currentWorkspaceId || 'default'}`);
            try {
                const response = await fetch(`/api/storage?key=${encodeURIComponent(key)}`, {
                    headers: getHeaders()
                });

                if (response.ok) {
                    const data = await response.json();
                    if (isMounted) {
                        setStoredValue(data.value ?? initialValue);
                    }
                } else {
                    // console.warn(`[useServerStorage] Failed to fetch ${key}: ${response.status}`);
                }
            } catch (error) {
                console.error(`Failed to fetch storage key "${key}":`, error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (currentWorkspaceId || isReadOnly) { // Allow fetch even if read-only (demo)
            fetchValue();
        } else {
            // If no workspace and not demo, we might be in weird state, but try anyway
            fetchValue();
        }

        return () => {
            isMounted = false;
        };
    }, [key, currentWorkspaceId, getHeaders, isReadOnly]);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to the server.
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            setStoredValue((prevValue) => {
                const valueToStore = value instanceof Function ? value(prevValue) : value;

                // [Fix] If Read-Only, skip server save to avoid 403
                if (isReadOnly) {
                    // console.log(`[useServerStorage] Read-Only Mode: Skipping save for "${key}"`);
                    return valueToStore;
                }

                // console.log(`[useServerStorage] Saving key: "${key}"...`);

                // Save to server
                fetch('/api/storage', {
                    method: 'POST',
                    headers: getHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ key, value: valueToStore }),
                }).then(res => {
                    if (res.ok) {
                        // console.log(`[useServerStorage] Successfully saved "${key}"`);
                    } else {
                        console.error(`[useServerStorage] Failed to save "${key}": ${res.status}`);
                    }
                }).catch(err => console.error(`Failed to save storage key "${key}":`, err));

                return valueToStore;
            });
        } catch (error) {
            console.error(`Error setting value for key "${key}":`, error);
        }
    }, [key, currentWorkspaceId, getHeaders, isReadOnly]);


    return [storedValue, setValue, isLoading];
}
