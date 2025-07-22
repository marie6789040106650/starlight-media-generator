/**
 * Reusable Error Alert Component
 * Provides consistent error display across the application
 */

import React from 'react';

interface ErrorAlertProps {
  error: string;
  onClear?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const variantIcons = {
  error: '⚠️',
  warning: '⚠️',
  info: 'ℹ️'
};

export function ErrorAlert({ 
  error, 
  onClear, 
  variant = 'error', 
  className = '' 
}: ErrorAlertProps) {
  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2">{variantIcons[variant]}</div>
          <div className="font-medium">{error}</div>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-current hover:opacity-75 text-sm font-medium"
            aria-label="清除错误"
          >
            清除
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorAlert;