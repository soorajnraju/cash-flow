import React, { useState } from 'react';
import { FaFlask, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAlert } from './AlertSystem';
import { safeParseFloat, isValidNumber, validateTransaction } from '../utils/validation';

const ValidationDemo = () => {
  const { showSuccess, showError, showWarning, showInfo } = useAlert();
  const [testValue, setTestValue] = useState('');

  const runValidationTests = () => {
    showInfo('Running validation tests...');

    // Test 1: Safe number parsing
    const testCases = ['123.45', 'abc', '', null, undefined, '0', '-50.25', 'NaN'];
    
    testCases.forEach((value, index) => {
      setTimeout(() => {
        const parsed = safeParseFloat(value);
        const isValid = isValidNumber(value);
        
        if (isValid && !isNaN(parsed)) {
          showSuccess(`Test ${index + 1}: "${value}" → ${parsed} ✓`);
        } else {
          showWarning(`Test ${index + 1}: "${value}" → ${parsed} (fallback to 0)`);
        }
      }, (index + 1) * 500);
    });

    // Test 2: Transaction validation
    setTimeout(() => {
      const validTransaction = {
        type: 'expense',
        amount: '150.75',
        category: 'Food',
        description: 'Groceries'
      };
      
      const invalidTransaction = {
        type: 'income',
        amount: 'invalid',
        category: '',
        description: ''
      };

      const validResult = validateTransaction(validTransaction);
      const invalidResult = validateTransaction(invalidTransaction);

      if (validResult.isValid) {
        showSuccess('✓ Valid transaction passed validation');
      } else {
        showError('Valid transaction failed: ' + validResult.errors.join(', '));
      }

      if (!invalidResult.isValid) {
        showWarning('⚠ Invalid transaction correctly rejected: ' + invalidResult.errors.join(', '));
      } else {
        showError('Invalid transaction incorrectly passed validation');
      }
    }, 5000);
  };

  const testUserInput = () => {
    if (!testValue.trim()) {
      showError('Please enter a value to test');
      return;
    }

    const parsed = safeParseFloat(testValue);
    const isValid = isValidNumber(testValue);

    if (isValid && !isNaN(parsed)) {
      showSuccess(`✓ "${testValue}" is valid: ${parsed}`);
    } else {
      showWarning(`⚠ "${testValue}" is invalid, using fallback: ${parsed}`);
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center">
        <FaFlask className="me-2" />
        <h5 className="mb-0">Validation System Demo</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h6><FaCheckCircle className="text-success me-2" />Automatic Tests</h6>
            <p className="text-muted small">
              Tests NaN prevention, data validation, and error handling throughout the application.
            </p>
            <button 
              className="btn btn-primary"
              onClick={runValidationTests}
            >
              <FaFlask className="me-2" />
              Run Validation Tests
            </button>
          </div>
          
          <div className="col-md-6">
            <h6><FaExclamationTriangle className="text-warning me-2" />Manual Test</h6>
            <p className="text-muted small">
              Enter any value to test the validation system (try: "abc", "123.45", "", "NaN").
            </p>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Enter test value..."
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testUserInput()}
              />
              <button 
                className="btn btn-outline-secondary"
                onClick={testUserInput}
              >
                Test
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <small className="text-muted">
            <strong>Improvements implemented:</strong>
            <ul className="mt-2 mb-0">
              <li>✅ Comprehensive form validation with nice alert messages</li>
              <li>✅ NaN prevention in all chart calculations</li>
              <li>✅ Safe data parsing throughout the application</li>
              <li>✅ Input validation for transactions, amounts, and dates</li>
              <li>✅ Error handling for invalid data imports</li>
              <li>✅ Toast notification system for user feedback</li>
            </ul>
          </small>
        </div>
      </div>
    </div>
  );
};

export default ValidationDemo;
