/**
 * Custom Button Component for AIPhDWriter
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[fullWidth && styles.fullWidth, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isDisabled
              ? ['#9CA3AF', '#9CA3AF']
              : [Colors.brand.primary, Colors.brand.secondary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            getSizeStyles(),
            fullWidth && styles.fullWidth,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {icon}
              <Text
                style={[
                  styles.buttonText,
                  { fontSize: getTextSize() },
                  icon && styles.textWithIcon,
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: Colors.light.backgroundSecondary,
          },
          text: {
            color: Colors.brand.primary,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: Colors.brand.primary,
          },
          text: {
            color: Colors.brand.primary,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: Colors.brand.primary,
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        getSizeStyles(),
        variantStyles.container,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : Colors.brand.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.buttonText,
              { fontSize: getTextSize() },
              variantStyles.text,
              icon && styles.textWithIcon,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});
