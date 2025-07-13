
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ActionButton {
  text: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  flex?: number;
}

interface ActionButtonRowProps {
  buttons: ActionButton[];
  gap?: number;
}

export default function ActionButtonRow({ buttons, gap = 12 }: ActionButtonRowProps) {
  return (
    <View style={[styles.buttonRow, { gap }]}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.button,
            {
              backgroundColor: button.backgroundColor || Colors.primary,
              flex: button.flex || 1,
              opacity: button.disabled ? 0.6 : 1,
            }
          ]}
          onPress={button.onPress}
          disabled={button.disabled}
        >
          <Text style={[
            styles.buttonText,
            { color: button.textColor || 'white' }
          ]}>
            {button.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
