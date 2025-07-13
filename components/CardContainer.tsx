
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
}

export default function CardContainer({
  children,
  style,
  padding = 20,
  margin,
  marginHorizontal = 16,
  marginVertical = 8,
}: CardContainerProps) {
  return (
    <View 
      style={[
        styles.card,
        {
          padding,
          margin,
          marginHorizontal,
          marginVertical,
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
});
