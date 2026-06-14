/**
 * Common form validation utilities
 * Used across all feature components for consistent validation
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a string field is not empty
 */
export const validateRequired = (value: string, fieldName: string = 'Field'): ValidationResult => {
  if (!value || !value.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  return { isValid: true };
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: true }; // Email is optional in most cases
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }
  return { isValid: true };
};

/**
 * Validates phone number format (basic validation)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true }; // Phone is optional in most cases
  }
  
  // Basic phone validation - allows digits, spaces, dashes, parentheses, and +
  const phoneRegex = /^[\d\s+()-]+$/;
  if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number',
    };
  }
  return { isValid: true };
};

/**
 * Validates URL format
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: true }; // URL is optional in most cases
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL',
    };
  }
};

/**
 * Validates date is not in the past (for events, etc.)
 */
export const validateFutureDate = (date: string, fieldName: string = 'Date'): ValidationResult => {
  if (!date) {
    return { isValid: true }; // Date validation will be handled by required check
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return {
      isValid: false,
      error: `${fieldName} cannot be in the past`,
    };
  }
  return { isValid: true };
};

/**
 * Validates date range (start date before end date)
 */
export const validateDateRange = (startDate: string, endDate: string): ValidationResult => {
  if (!startDate || !endDate) {
    return { isValid: true }; // Individual date validation will be handled separately
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return {
      isValid: false,
      error: 'End date must be after start date',
    };
  }
  return { isValid: true };
};

/**
 * Validates multiple required fields at once
 */
export const validateMultipleRequired = (
  fields: Array<{ value: string; name: string }>
): ValidationResult => {
  for (const field of fields) {
    const result = validateRequired(field.value, field.name);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

/**
 * Validates file size (in MB)
 */
export const validateFileSize = (file: File, maxSizeMB: number = 5): ValidationResult => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }
  return { isValid: true };
};

/**
 * Validates file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
): ValidationResult => {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  return { isValid: true };
};

