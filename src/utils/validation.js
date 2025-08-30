/**
 * Validation utilities and helper functions
 */

// Number validation helpers
export const isValidNumber = (value) => {
  return !isNaN(value) && isFinite(value) && value !== null && value !== undefined && value !== '';
};

export const safeParseFloat = (value, defaultValue = 0) => {
  if (value === '' || value === null || value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isValidNumber(parsed) ? parsed : defaultValue;
};

export const safeParseInt = (value, defaultValue = 0) => {
  if (value === '' || value === null || value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isValidNumber(parsed) ? parsed : defaultValue;
};

// Currency validation
export const validateCurrency = (amount) => {
  const errors = [];
  
  if (!isValidNumber(amount)) {
    errors.push('Amount must be a valid number');
  } else if (amount < 0) {
    errors.push('Amount cannot be negative');
  } else if (amount > 999999999) {
    errors.push('Amount is too large');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Date validation
export const validateDate = (date) => {
  const errors = [];
  
  if (!date) {
    errors.push('Date is required');
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push('Invalid date format');
    } else if (dateObj > new Date()) {
      errors.push('Date cannot be in the future');
    } else if (dateObj < new Date('2000-01-01')) {
      errors.push('Date is too far in the past');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// String validation
export const validateString = (value, minLength = 1, maxLength = 255) => {
  const errors = [];
  
  if (!value || typeof value !== 'string') {
    errors.push('This field is required');
  } else {
    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      errors.push(`Minimum ${minLength} characters required`);
    } else if (trimmed.length > maxLength) {
      errors.push(`Maximum ${maxLength} characters allowed`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: value ? value.trim() : ''
  };
};

// Transaction validation
export const validateTransaction = (transaction) => {
  const errors = {};
  
  // Validate amount
  const amountValidation = validateCurrency(transaction.amount);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.errors;
  }
  
  // Validate description
  const descriptionValidation = validateString(transaction.description, 1, 100);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.errors;
  }
  
  // Validate date
  const dateValidation = validateDate(transaction.date);
  if (!dateValidation.isValid) {
    errors.date = dateValidation.errors;
  }
  
  // Validate type
  if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
    errors.type = ['Transaction type must be either income or expense'];
  }
  
  // Validate category
  const categoryValidation = validateString(transaction.category, 1, 50);
  if (!categoryValidation.isValid) {
    errors.category = categoryValidation.errors;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Category validation
export const validateCategory = (category) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateString(category.name, 1, 50);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.errors;
  }
  
  // Validate budgeted amount
  if (category.budgeted !== undefined) {
    const budgetValidation = validateCurrency(category.budgeted);
    if (!budgetValidation.isValid) {
      errors.budgeted = budgetValidation.errors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Recurring transaction validation
export const validateRecurringTransaction = (transaction) => {
  const errors = {};
  
  // Validate amount
  const amountValidation = validateCurrency(transaction.amount);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.errors;
  }
  
  // Validate description
  const descriptionValidation = validateString(transaction.description, 1, 100);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.errors;
  }
  
  // Validate frequency
  if (!transaction.frequency || !['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'].includes(transaction.frequency)) {
    errors.frequency = ['Please select a valid frequency'];
  }
  
  // Validate type
  if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
    errors.type = ['Transaction type must be either income or expense'];
  }
  
  // Validate category
  const categoryValidation = validateString(transaction.category, 1, 50);
  if (!categoryValidation.isValid) {
    errors.category = categoryValidation.errors;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Chart data validation
export const validateChartData = (data) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    if (typeof item === 'number') {
      return isValidNumber(item) ? item : 0;
    }
    if (typeof item === 'object' && item !== null) {
      const cleanItem = { ...item };
      Object.keys(cleanItem).forEach(key => {
        if (typeof cleanItem[key] === 'number') {
          cleanItem[key] = isValidNumber(cleanItem[key]) ? cleanItem[key] : 0;
        }
      });
      return cleanItem;
    }
    return item;
  });
};
