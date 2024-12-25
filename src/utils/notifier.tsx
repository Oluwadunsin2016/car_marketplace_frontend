import React from 'react';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

interface NotifierProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const notifier = ({ message, type }: NotifierProps): void => {
  switch (type) {
    case 'success':
      toast.success(
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          {message}
        </div>,
        {
          className: 'bg-green-100 text-green-800 p-4 rounded-lg shadow-lg',
        }
      );
      break;
    case 'error':
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationCircle className="text-red-500" />
          {message}
        </div>,
        {
          className: 'bg-red-100 text-red-800 p-4 rounded-lg shadow-lg',
        }
      );
      break;
    case 'warning':
      toast(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-500" />
          {message}
        </div>,
        {
          className: 'bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-lg',
        }
      );
      break;
    case 'info':
      toast(
        <div className="flex items-center gap-2">
          <FaInfoCircle className="text-blue-500" />
          {message}
        </div>,
        {
          className: 'bg-blue-100 text-blue-800 p-4 rounded-lg shadow-lg',
        }
      );
      break;
    default:
      console.warn(`Unsupported toast type: ${type}`);
      toast(message); // Generic fallback
      break;
  }
};
