import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`
        flex items-start gap-3 p-4 border rounded-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex-1 ${className}`}>
      {children}
    </div>
  );
};