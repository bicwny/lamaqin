
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

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
    <View className="flex-row" style={{ gap }}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          className={`py-3 px-4 rounded-lg items-center justify-center min-h-[40px] ${
            button.disabled ? 'opacity-60' : ''
          }`}
          style={{
            backgroundColor: button.backgroundColor || '#ef4444', // red-500 equivalent
            flex: button.flex || 1,
          }}
          onPress={button.onPress}
          disabled={button.disabled}
        >
          <Text 
            className="text-sm font-semibold"
            style={{ color: button.textColor || 'white' }}
          >
            {button.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

