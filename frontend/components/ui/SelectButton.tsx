/**
 * SelectButton Component for AIPhDWriter
 * Used for selecting options like audience, style, etc.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface SelectButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  description?: string;
}

export function SelectButton({
  label,
  selected,
  onPress,
  style,
  description,
}: SelectButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        selected && styles.buttonSelected,
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
      {description && (
        <Text style={[styles.description, selected && styles.descriptionSelected]}>
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

interface SelectButtonGroupProps {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
  horizontal?: boolean;
}

export function SelectButtonGroup({
  options,
  value,
  onChange,
  style,
  horizontal = true,
}: SelectButtonGroupProps) {
  return (
    <View style={[horizontal ? styles.horizontalContainer : styles.verticalContainer, style]}>
      {options.map((option) => (
        <SelectButton
          key={option.value}
          label={option.label}
          description={option.description}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
          style={horizontal ? styles.horizontalButton : styles.verticalButton}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSelected: {
    backgroundColor: Colors.brand.primary + '10',
    borderColor: Colors.brand.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  labelSelected: {
    color: Colors.brand.primary,
  },
  description: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  descriptionSelected: {
    color: Colors.brand.primary,
  },
  horizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  verticalContainer: {
    gap: 8,
  },
  horizontalButton: {
    flex: 1,
    minWidth: 80,
  },
  verticalButton: {
    width: '100%',
  },
});
