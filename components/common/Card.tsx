
import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export function Card({ children, padding = 'md', shadow = true, className = '', ...props }: CardProps) {
  const paddingClass = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  }[padding];

  const shadowClass = shadow ? 'shadow-sm' : '';

  return (
    <View 
      className={`bg-white rounded-xl border border-gray-100 ${paddingClass} ${shadowClass} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
