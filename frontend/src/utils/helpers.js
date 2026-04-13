import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'metayb-ecommerce-secret-key-2024';

/**
 * Encrypt data before storing
 */
export const encryptData = (data) => {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

/**
 * Decrypt data after retrieving
 */
export const decryptData = (encryptedData) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

/**
 * Store encrypted data in localStorage
 */
export const setSecureItem = (key, value) => {
    const encrypted = encryptData(value);
    if (encrypted) {
        localStorage.setItem(key, encrypted);
    }
};

/**
 * Retrieve and decrypt data from localStorage
 */
export const getSecureItem = (key) => {
    const encrypted = localStorage.getItem(key);
    if (encrypted) {
        return decryptData(encrypted);
    }
    return null;
};

/**
 * Remove item from localStorage
 */
export const removeSecureItem = (key) => {
    localStorage.removeItem(key);
};

/**
 * Format price with currency
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(price);
};

/**
 * Format date
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Get image URL
 */
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl}`;
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
