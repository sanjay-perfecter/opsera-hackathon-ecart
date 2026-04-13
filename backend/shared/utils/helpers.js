const CryptoJS = require('crypto-js');

/**
 * Encrypt data using AES encryption
 * @param {String} data - Data to encrypt
 * @returns {String} Encrypted data
 */
const encryptData = (data) => {
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key not configured');
    }
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

/**
 * Decrypt data using AES decryption
 * @param {String} encryptedData - Encrypted data
 * @returns {String} Decrypted data
 */
const decryptData = (encryptedData) => {
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key not configured');
    }
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

/**
 * Format success response
 */
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Format error response
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors !== null) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Generate pagination metadata
 */
const getPagination = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  
  return {
    currentPage,
    itemsPerPage,
    totalItems: total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

module.exports = {
  encryptData,
  decryptData,
  successResponse,
  errorResponse,
  getPagination
};
