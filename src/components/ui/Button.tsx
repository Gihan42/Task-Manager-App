import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) => {
  
  const getVariantClass = () => {
      switch (variant) {
          case 'secondary': return 'btn-secondary';
          case 'outline': return 'btn-outline';
          case 'ghost': return 'btn-ghost';
          default: return 'btn-primary';
      }
  };

  const getSizeClass = () => {
      switch (size) {
          case 'sm': return 'btn-sm';
          case 'lg': return 'btn-lg';
          default: return 'btn-md';
      }
  };

  const baseClasses = "inline-flex items-center justify-center transition-opacity disabled:opacity-50 disabled:pointer-events-none";

  return (
    <button 
      className={`${baseClasses} ${getVariantClass()} ${getSizeClass()} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
