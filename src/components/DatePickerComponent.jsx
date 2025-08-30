import React, { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";

// Custom input component to integrate with Bootstrap
const CustomDateInput = forwardRef(({ value, onClick, placeholder, className, disabled, hasError, id }, ref) => (
  <div className="input-group">
    <input
      ref={ref}
      type="text"
      id={id}
      className={`form-control ${hasError ? 'is-invalid' : ''} ${className || ''}`.trim()}
      value={value || ''}
      onClick={onClick}
      placeholder={placeholder || 'Select a date'}
      readOnly
      disabled={disabled}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    />
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={onClick}
      disabled={disabled}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <FaCalendarAlt />
    </button>
  </div>
));

const DatePickerComponent = ({ 
  label, 
  value, 
  onChange, 
  required = false, 
  min = null, 
  max = null, 
  className = '', 
  error = '', 
  helpText = '',
  placeholder = '',
  disabled = false,
  id = null
}) => {
  // Convert string dates to Date objects
  const selectedDate = value ? new Date(value) : null;
  const minDate = min ? new Date(min) : new Date('2020-01-01');
  const maxDate = max ? new Date(max) : new Date();

  const handleDateChange = (date) => {
    if (date && onChange) {
      // Convert Date object back to YYYY-MM-DD string format
      const dateString = date.toISOString().split('T')[0];
      onChange(dateString);
    } else if (!date && onChange) {
      onChange('');
    }
  };

  const generateId = () => {
    return id || `date-picker-${Math.random().toString(36).substr(2, 9)}`;
  };

  const inputId = generateId();
  const hasError = error && error.length > 0;

  return (
    <div className={`date-picker-component ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          <FaCalendarAlt className="me-2" />
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        dateFormat="MMM dd, yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        placeholderText={placeholder || 'Select a date'}
        customInput={
          <CustomDateInput 
            hasError={hasError}
            className={className}
            id={inputId}
            disabled={disabled}
            placeholder={placeholder}
          />
        }
        popperClassName="react-datepicker-popper"
        calendarClassName="react-datepicker-calendar"
        todayButton="Today"
        showPopperArrow={false}
        fixedHeight
        popperPlacement="bottom-start"
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 5]
            }
          }
        ]}
      />

      {/* Help text or constraints info */}
      {helpText && !hasError && (
        <div className="form-text">
          {helpText}
        </div>
      )}
      
      {/* Date constraints info */}
      {!hasError && !helpText && (minDate || maxDate) && (
        <div className="form-text">
          Date range: {minDate.toLocaleDateString()} to {maxDate.toLocaleDateString()}
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <div className="invalid-feedback d-block">
          <FaExclamationTriangle className="me-1" />
          {error}
        </div>
      )}
    </div>
  );
};

// Enhanced date picker with validation
export const ValidatedDatePicker = ({ 
  label, 
  value, 
  onChange, 
  validation = {},
  ...props 
}) => {
  const validateDate = (dateValue) => {
    if (!dateValue && validation.required) {
      return 'Date is required';
    }
    
    if (dateValue) {
      const selectedDate = new Date(dateValue);
      const today = new Date();
      
      // Check if date is in the future (for transaction dates)
      if (validation.maxToday && selectedDate > today) {
        return 'Date cannot be in the future';
      }
      
      // Check if date is too far in the past
      if (validation.minYear) {
        const minDate = new Date(`${validation.minYear}-01-01`);
        if (selectedDate < minDate) {
          return `Date cannot be before ${validation.minYear}`;
        }
      }
      
      // Check if date is too far in the future (for recurring transactions)
      if (validation.maxFuture) {
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + validation.maxFuture);
        if (selectedDate > maxFutureDate) {
          return `Date cannot be more than ${validation.maxFuture} years in the future`;
        }
      }
    }
    
    return '';
  };

  const error = validateDate(value);

  return (
    <DatePickerComponent
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      required={validation.required}
      {...props}
    />
  );
};

// Quick date presets component
export const DatePresets = ({ onSelectDate, className = '' }) => {
  const presets = [
    { label: 'Today', getValue: () => new Date().toISOString().split('T')[0] },
    { label: 'Yesterday', getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }},
    { label: 'Last Week', getValue: () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      return lastWeek.toISOString().split('T')[0];
    }},
    { label: 'Last Month', getValue: () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return lastMonth.toISOString().split('T')[0];
    }},
    { label: 'Start of Year', getValue: () => {
      const startOfYear = new Date();
      startOfYear.setMonth(0, 1);
      return startOfYear.toISOString().split('T')[0];
    }}
  ];

  return (
    <div className={`date-presets ${className}`.trim()}>
      <small className="text-muted d-block mb-2">Quick select:</small>
      <div className="btn-group-sm" role="group">
        {presets.map((preset, index) => (
          <button
            key={index}
            type="button"
            className="btn btn-outline-secondary btn-sm me-1 mb-1"
            onClick={() => onSelectDate(preset.getValue())}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatePickerComponent;
