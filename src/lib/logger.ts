/**
 * Centralized logging utility with environment-based control
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

export const logger = {
    debug: (...args: any[]) => {
        if (isDevelopment || isDebugMode) {
            console.log('[DEBUG]', ...args);
        }
    },

    info: (...args: any[]) => {
        console.log('[INFO]', ...args);
    },

    warn: (...args: any[]) => {
        console.warn('[WARN]', ...args);
    },

    error: (...args: any[]) => {
        console.error('[ERROR]', ...args);
    },

    // Specific loggers for different modules
    analysis: (...args: any[]) => {
        if (isDevelopment || isDebugMode) {
            console.log('[ANALYSIS]', ...args);
        }
    },

    auth: (...args: any[]) => {
        if (isDevelopment || isDebugMode) {
            console.log('[AUTH]', ...args);
        }
    },

    middleware: (...args: any[]) => {
        if (isDevelopment || isDebugMode) {
            console.log('[MIDDLEWARE]', ...args);
        }
    },

    critique: (...args: any[]) => {
        if (isDevelopment || isDebugMode) {
            console.log('[CRITIQUE]', ...args);
        }
    },

    governance: (...args: any[]) => {
        if (isDevelopment || isDebugMode) {
            console.log('[GOVERNANCE]', ...args);
        }
    },

    audit: (...args: any[]) => {
        // Audit logs are critical, always show them or send them to external
        console.log('[AUDIT]', ...args);
    },

    collaboration: (...args: any[]) => {
        if (isDevelopment || isDebugMode) {
            console.log('[COLLAB]', ...args);
        }
    }
};
