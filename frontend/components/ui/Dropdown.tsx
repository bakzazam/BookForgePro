/**
 * Dropdown Component for BookForgePro
 * Clean, mobile-friendly dropdown with modal picker
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const { height } = Dimensions.get('window');

interface DropdownOption {
  label: string;
  value: string;
  [key: string]: any;
}

interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Dropdown({ label, value, options, onChange, placeholder = 'Select...' }: DropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorText, !selectedOption && styles.placeholderText]} numberOfLines={1}>
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.light.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === option.value && styles.optionTextSelected
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color={Colors.brand.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    marginRight: 8,
  },
  placeholderText: {
    color: Colors.light.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border + '40',
  },
  optionItemSelected: {
    backgroundColor: Colors.brand.primary + '10',
    borderRadius: 8,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    marginRight: 8,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: Colors.brand.primary,
  },
});
