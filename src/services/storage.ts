import type { Project, User, Client } from '../types';
import CryptoJS from 'crypto-js';

// --- SECURITY CONSTANTS ---
const ENCRYPTION_PREFIX = 'enc_v1_';
const STORAGE_PREFIX = 'dryflow_';
const SECRET_SALT = 'dryflow_secure_salt_2024'; 

/**
 * Generates a storage key isolated by user ID.
 */
const getUserKey = (userId: string, key: string) => {
  return `${STORAGE_PREFIX}${userId}_${key}`;
};

/**
 * Encrypts data using AES.
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
        // Fallback for legacy unencrypted data
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

// --- PROJECT DATA ---

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

// --- CLIENT DATA ---

export const saveClients = (userId: string, clients: Client[]) => {
  const key = getUserKey(userId, 'clients');
  const encrypted = encryptData(clients, userId);
  localStorage.setItem(key, encrypted);
};

export const getClients = (userId: string): Client[] => {
  const key = getUserKey(userId, 'clients');
  const data = localStorage.getItem(key);
  if (!data) return [];
  return decryptData<Client[]>(data, userId) || [];
};

export const saveSingleClient = (userId: string, client: Client): boolean => {
  const user = getUser(userId);
  // Free users limited to 1 client
  const clients = getClients(userId);
  
  if (!user?.isPro && clients.length >= 1 && !clients.find(c => c.id === client.id)) {
      return false; // Limit reached
  }

  const existingIndex = clients.findIndex(c => c.id === client.id);
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  saveClients(userId, clients);
  return true;
};

export const deleteClient = (userId: string, clientId: string) => {
  const clients = getClients(userId).filter(c => c.id !== clientId);
  saveClients(userId, clients);
};


// --- ACCOUNT DELETION ---

export const deleteAccount = (userId: string) => {
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