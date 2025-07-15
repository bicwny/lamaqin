
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  dharmaName: string;
  size?: number;
}

// Predefined colors with good contrast
const AVATAR_COLORS = [
  { bg: '#6366f1', text: '#ffffff' }, // Indigo
  { bg: '#8b5cf6', text: '#ffffff' }, // Violet
  { bg: '#06b6d4', text: '#ffffff' }, // Cyan
  { bg: '#10b981', text: '#ffffff' }, // Emerald
  { bg: '#f59e0b', text: '#ffffff' }, // Amber
  { bg: '#ef4444', text: '#ffffff' }, // Red
  { bg: '#ec4899', text: '#ffffff' }, // Pink
  { bg: '#84cc16', text: '#ffffff' }, // Lime
  { bg: '#3b82f6', text: '#ffffff' }, // Blue
  { bg: '#8b5a2b', text: '#ffffff' }, // Brown
  { bg: '#64748b', text: '#ffffff' }, // Slate
  { bg: '#dc2626', text: '#ffffff' }, // Red-600
  { bg: '#059669', text: '#ffffff' }, // Emerald-600
  { bg: '#7c3aed', text: '#ffffff' }, // Violet-600
  { bg: '#db2777', text: '#ffffff' }, // Pink-600
];

export default function Avatar({ dharmaName, size = 60 }: AvatarProps) {
  // Get the first character of dharma name
  const initial = dharmaName?.charAt(0)?.toUpperCase() || '?';
  
  // Generate consistent color based on dharma name
  const colorIndex = dharmaName ? 
    dharmaName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_COLORS.length : 
    0;
  
  const colors = AVATAR_COLORS[colorIndex];
  
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.bg,
  };
  
  const textStyle = {
    color: colors.text,
    fontSize: size * 0.4, // 40% of avatar size
    fontWeight: '600' as const,
  };

  return (
    <View style={[styles.avatar, avatarStyle]}>
      <Text style={[styles.initial, textStyle]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  initial: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
