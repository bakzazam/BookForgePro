/**
 * Input Component for AIPhDWriter
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helper,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={Colors.light.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {helper && !error && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.light.card,
  },
  inputContainerError: {
    borderColor: Colors.light.error,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  iconLeft: {
    paddingLeft: 16,
  },
  iconRight: {
    paddingRight: 16,
  },
  error: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 4,
    marginLeft: 4,
  },
  helper: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 4,
    marginLeft: 4,
  },
});
