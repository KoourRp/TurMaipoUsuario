// src/components/StatusAlert.tsx
import React from 'react';

interface StatusAlertProps {
  type: 'error' | 'loading';
  message: string;
}

const StatusAlert = ({ type, message }: StatusAlertProps) => {
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const icon = type === 'error' ? '⚠️' : '🔄';

  return (
    <div className={`absolute top-4 ${type === 'error' ? 'left-4' : 'right-4'} ${bgColor} text-white px-4 py-2 rounded shadow-md z-[1000] text-sm sm:text-base`}>
      {icon} {message}
    </div>
  );
};

export default StatusAlert;