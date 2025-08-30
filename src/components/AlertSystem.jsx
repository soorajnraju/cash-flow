import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const alert = {
      id,
      message,
      type, // success, error, warning, info
      duration,
      timestamp: Date.now()
    };

    setAlerts(prev => [...prev, alert]);

    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, duration) => addAlert(message, 'success', duration), [addAlert]);
  const showError = useCallback((message, duration) => addAlert(message, 'error', duration), [addAlert]);
  const showWarning = useCallback((message, duration) => addAlert(message, 'warning', duration), [addAlert]);
  const showInfo = useCallback((message, duration) => addAlert(message, 'info', duration), [addAlert]);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertContainer alerts={alerts} onRemove={removeAlert} />
    </AlertContext.Provider>
  );
};

const AlertContainer = ({ alerts, onRemove }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="alert-container position-fixed" style={{ 
      top: '20px', 
      right: '20px', 
      zIndex: 1050,
      maxWidth: '400px'
    }}>
      {alerts.map(alert => (
        <Alert key={alert.id} alert={alert} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Alert = ({ alert, onRemove }) => {
  const getAlertClass = () => {
    switch (alert.type) {
      case 'success': return 'alert-success';
      case 'error': return 'alert-danger';
      case 'warning': return 'alert-warning';
      case 'info': 
      default: return 'alert-info';
    }
  };

  const getIcon = () => {
    switch (alert.type) {
      case 'success': return <FaCheckCircle />;
      case 'error': return <FaExclamationTriangle />;
      case 'warning': return <FaExclamationTriangle />;
      case 'info':
      default: return <FaInfoCircle />;
    }
  };

  return (
    <div 
      className={`alert ${getAlertClass()} alert-dismissible fade show mb-2`}
      style={{ 
        animation: 'slideInRight 0.3s ease-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      <div className="d-flex align-items-center">
        <div className="me-2">
          {getIcon()}
        </div>
        <div className="flex-grow-1">
          {alert.message}
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={() => onRemove(alert.id)}
          aria-label="Close"
        >
        </button>
      </div>
    </div>
  );
};

// Validation error display component
export const ValidationErrors = ({ errors, field }) => {
  if (!errors || !errors[field] || errors[field].length === 0) {
    return null;
  }

  return (
    <div className="invalid-feedback d-block">
      {errors[field].map((error, index) => (
        <div key={index} className="text-danger small">
          <FaExclamationTriangle className="me-1" />
          {error}
        </div>
      ))}
    </div>
  );
};

// Form field wrapper with validation
export const ValidatedField = ({ 
  label, 
  children, 
  errors, 
  field, 
  required = false,
  helpText = null 
}) => {
  const hasError = errors && errors[field] && errors[field].length > 0;

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div className={hasError ? 'has-validation' : ''}>
        {React.cloneElement(children, {
          className: `${children.props.className || 'form-control'} ${hasError ? 'is-invalid' : ''}`.trim()
        })}
        <ValidationErrors errors={errors} field={field} />
        {helpText && !hasError && (
          <div className="form-text">{helpText}</div>
        )}
      </div>
    </div>
  );
};
