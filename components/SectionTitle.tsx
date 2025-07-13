
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface SectionTitleProps {
  title: string;
  style?: TextStyle;
  marginTop?: number;
  marginBottom?: number;
  marginHorizontal?: number;
}

export default function SectionTitle({
  title,
  style,
  marginTop = 16,
  marginBottom = 8,
  marginHorizontal = 0,
}: SectionTitleProps) {
  return (
    <Text 
      style={[
        styles.sectionTitle,
        {
          marginTop,
          marginBottom,
          marginHorizontal,
        },
        style
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
