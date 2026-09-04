/**
 * accountUtils.js
 * Utilities for tracking recently-used accounts locally and generating
 * deterministic avatar colors and initials for the Google-style account switcher.
 */

const KNOWN_ACCOUNTS_KEY = 'recon_ai_known_accounts';
const MAX_KNOWN_ACCOUNTS = 5;

// Deterministic color palette for avatars (vibrant, accessible colors)
export const AVATAR_PALETTES = [
  { bg: 'bg-blue-600', text: 'text-white', hex: '#2563EB', ring: 'ring-blue-500' },
  { bg: 'bg-emerald-600', text: 'text-white', hex: '#059669', ring: 'ring-emerald-500' },
  { bg: 'bg-amber-600', text: 'text-white', hex: '#D97706', ring: 'ring-amber-500' },
  { bg: 'bg-violet-600', text: 'text-white', hex: '#7C3AED', ring: 'ring-violet-500' },
  { bg: 'bg-rose-600', text: 'text-white', hex: '#E11D48', ring: 'ring-rose-500' },
  { bg: 'bg-cyan-600', text: 'text-white', hex: '#0891B2', ring: 'ring-cyan-500' },
  { bg: 'bg-indigo-600', text: 'text-white', hex: '#4F46E5', ring: 'ring-indigo-500' },
  { bg: 'bg-teal-600', text: 'text-white', hex: '#0D9488', ring: 'ring-teal-500' },
];

/**
 * Returns a deterministic avatar color configuration based on the user's email.
 */
export const getAvatarStyle = (email = '') => {
  const str = (email || '').toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
};

/**
 * Returns the first initial character from a full name or email.
 */
export const getInitial = (name = '', email = '') => {
  if (name && name.trim()) {
    return name.trim().charAt(0).toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim().charAt(0).toUpperCase();
  }
  return 'U';
};

const DEFAULT_KNOWN_ACCOUNTS = [
  {
    email: 'auditor@razorpay.com',
    full_name: 'Adarsh Auditor',
    avatar_color: '#2563EB',
  },
  {
    email: 'auditor2@razorpay.com',
    full_name: 'Auditor Demo',
    avatar_color: '#059669',
  },
];

/**
 * Retrieves recently used accounts from localStorage.
 */
export const getKnownAccounts = () => {
  try {
    const raw = localStorage.getItem(KNOWN_ACCOUNTS_KEY);
    if (!raw) {
      // Seed default accounts if nothing stored yet
      localStorage.setItem(KNOWN_ACCOUNTS_KEY, JSON.stringify(DEFAULT_KNOWN_ACCOUNTS));
      return DEFAULT_KNOWN_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Error reading known accounts:', err);
    return [];
  }
};

/**
 * Saves or updates a known account in localStorage.
 * Avoids duplicates, updates recent position, and caps list at MAX_KNOWN_ACCOUNTS.
 */
export const saveKnownAccount = (user) => {
  if (!user || !user.email) return;
  try {
    const email = user.email.toLowerCase().trim();
    const fullName = user.full_name || user.fullName || email.split('@')[0];
    const avatarColor = getAvatarStyle(email).hex;

    let accounts = getKnownAccounts();
    // Filter out existing occurrence
    accounts = accounts.filter((acc) => acc.email?.toLowerCase().trim() !== email);

    // Prepend newly active account
    accounts.unshift({
      email,
      full_name: fullName,
      avatar_color: avatarColor,
      last_active: new Date().toISOString(),
    });

    // Cap at maximum
    if (accounts.length > MAX_KNOWN_ACCOUNTS) {
      accounts = accounts.slice(0, MAX_KNOWN_ACCOUNTS);
    }

    localStorage.setItem(KNOWN_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.warn('Error saving known account:', err);
  }
};

/**
 * Removes a specific account from the known accounts list.
 */
export const removeKnownAccount = (emailToRemove) => {
  try {
    let accounts = getKnownAccounts();
    accounts = accounts.filter(
      (acc) => acc.email?.toLowerCase().trim() !== emailToRemove.toLowerCase().trim()
    );
    localStorage.setItem(KNOWN_ACCOUNTS_KEY, JSON.stringify(accounts));
    return accounts;
  } catch (err) {
    console.warn('Error removing known account:', err);
    return [];
  }
};
