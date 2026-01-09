/**
 * Centralized Custom React Hooks
 * 
 * This file exports all custom hooks used throughout the application.
 * Import hooks from this file using: import { useHookName } from '@/hooks'
 */

/**
 * useQuota - Hook for checking and managing user quota/usage limits
 * 
 * Returns: { usage, loading, error, checkQuota, refresh }
 * - usage: Current usage data for all features
 * - loading: Boolean indicating if quota data is being fetched
 * - error: Error message if quota fetch failed
 * - checkQuota(feature): Function to check quota for a specific feature
 * - refresh: Function to manually refresh quota data
 * 
 * Dependencies: subscriptionApi, quotaChecker utility
 * 
 * Usage:
 * const { usage, checkQuota, refresh } = useQuota();
 * const articleQuota = checkQuota('articles');
 */
export { useQuota } from './useQuota.js';

/**
 * useAuth - Hook for authentication state and operations
 * 
 * Returns: { user, loading, isAuthenticated, isAdmin, login, register, logout, updateUser, checkAuth, loginWithProvider }
 * - user: Current authenticated user object (includes role, email, etc.)
 * - loading: Boolean indicating if auth check is in progress
 * - isAuthenticated: Boolean indicating if user is authenticated
 * - isAdmin: Boolean indicating if user has admin role
 * - login: Function to log in with email/password
 * - register: Function to register new user
 * - logout: Function to log out current user
 * - updateUser: Function to update user data
 * - checkAuth: Function to manually check authentication status
 * - loginWithProvider: Function to initiate OAuth login
 * 
 * Dependencies: AuthContext provider must wrap the component tree
 * 
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export { useAuth } from '../../../context/AuthContext.js';

/**
 * useTheme - Hook for theme management (dark/light mode)
 * 
 * Returns: { theme, toggleTheme }
 * - theme: Current theme ('dark' or 'light')
 * - toggleTheme: Function to switch between dark and light themes
 * 
 * Dependencies: ThemeContext provider must wrap the component tree
 * Theme is persisted to localStorage automatically
 * 
 * Usage:
 * const { theme, toggleTheme } = useTheme();
 */
export { useTheme } from '../context/ThemeContext.js';

/**
 * useSettings - Hook for application settings management
 * 
 * Returns: { language, editorMode, settings, updateSettings }
 * - language: Current language setting
 * - editorMode: Current editor mode setting
 * - settings: Full settings object
 * - updateSettings: Function to update settings (merges with existing)
 * 
 * Dependencies: SettingsContext provider must wrap the component tree
 * Settings are persisted to localStorage automatically
 * 
 * Usage:
 * const { settings, updateSettings } = useSettings();
 * updateSettings({ language: 'es' });
 */
export { useSettings } from '../context/SettingsContext.js';
