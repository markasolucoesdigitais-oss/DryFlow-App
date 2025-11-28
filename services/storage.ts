import type { Project, User } from '../types';
import CryptoJS from 'crypto-js';

// --- SECURITY CONSTANTS ---
// In a real production app, the salt would come from a backend or environment variable.
// Since this is client-side only, we use a static salt to prevent simple text scraping.
const ENCRYPTION_PREFIX = 'enc_v1_';
const STORAGE_PREFIX = 'dryflow_';
const SECRET_SALT = 'dryflow_secure_salt_2024'; 

/**
 * Generates a storage key isolated by user ID.
 * Example: dryflow_user_12345_projects
 */
const getUserKey = (userId: string, key: string) => {
  return `${STORAGE_PREFIX}${userId}_${key}`;
};

/**
 * Encrypts data using AES.
 * Uses the userId + global salt as the key to ensure one user cannot decrypt another's data easily.
 */
const encryptData = (data: any, userId: string): string => {
  try {
    const jsonString = JSON.stringify(data);
    const passphrase = `${userId}_${SECRET_SALT}`;
    const encrypted = CryptoJS.AES.encrypt(jsonString, passphrase).toString();
    return `${ENCRYPTION_PREFIX}${encrypted}`;
  } catch (e) {
    console.error("Encryption failed", e);
    return '';
  }
};

/**
 * Decrypts data using AES.
 */
const decryptData = <T>(ciphertext: string, userId: string): T | null => {
  try {
    if (!ciphertext.startsWith(ENCRYPTION_PREFIX)) {
        // Fallback for legacy unencrypted data (migration path)
        return JSON.parse(ciphertext);
    }
    const rawCipher = ciphertext.replace(ENCRYPTION_PREFIX, '');
    const passphrase = `${userId}_${SECRET_SALT}`;
    const bytes = CryptoJS.AES.decrypt(rawCipher, passphrase);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};

// --- AUTH MANAGEMENT ---

// The "Active Session" is the only thing stored globally (not encrypted per user, but references the ID)
const SESSION_KEY = 'dryflow_session_id';

export const saveSession = (userId: string) => {
  localStorage.setItem(SESSION_KEY, userId);
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSessionUserId = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

// --- USER DATA ---

export const saveUser = (user: User) => {
  // We store the user profile. 
  // Note: We don't encrypt the user profile KEY itself so we can find it, 
  // but we encrypt the CONTENT.
  const key = getUserKey(user.id, 'profile');
  const encrypted = encryptData(user, user.id);
  localStorage.setItem(key, encrypted);
  saveSession(user.id);
};

export const getUser = (userId: string): User | null => {
  const key = getUserKey(userId, 'profile');
  const data = localStorage.getItem(key);
  if (!data) return null;
  return decryptData<User>(data, userId);
};

export const getCurrentUser = (): User | null => {
  const userId = getSessionUserId();
  if (!userId) return null;
  return getUser(userId);
};

export const upgradeUserToPro = (userId: string): User | null => {
  const user = getUser(userId);
  if (user) {
    const upgraded: User = { ...user, isPro: true };
    saveUser(upgraded);
    return upgraded;
  }
  return null;
};

// --- PROJECT DATA (ENCRYPTED & ISOLATED) ---

export const saveProjects = (userId: string, projects: Project[]) => {
  const key = getUserKey(userId, 'projects');
  const encrypted = encryptData(projects, userId);
  localStorage.setItem(key, encrypted);
};

export const getProjects = (userId: string): Project[] => {
  const key = getUserKey(userId, 'projects');
  const data = localStorage.getItem(key);
  if (!data) return [];
  return decryptData<Project[]>(data, userId) || [];
};

export const saveSingleProject = (userId: string, project: Project): boolean => {
  const user = getUser(userId);
  if (!user?.isPro) return false;

  const projects = getProjects(userId);
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  
  saveProjects(userId, projects);
  return true;
};

export const deleteProject = (userId: string, projectId: string) => {
  const projects = getProjects(userId).filter(p => p.id !== projectId);
  saveProjects(userId, projects);
};

// --- ACCOUNT DELETION ---

export const deleteAccount = (userId: string) => {
  // Remove all keys related to this user
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(`_${userId}_`)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  clearSession();
};