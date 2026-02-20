import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border";
  
  const variants = {
    primary: "bg-white text-black border-white hover:bg-gray-200",
    secondary: "bg-transparent text-white border-white hover:bg-white/10",
    danger: "bg-red-900/20 text-red-500 border-red-500 hover:bg-red-900/40",
    ghost: "bg-transparent text-gray-400 border-transparent hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};