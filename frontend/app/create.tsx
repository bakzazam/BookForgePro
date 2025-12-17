/**
 * BookForgePro - Create Book Screen
 * Redesigned with dropdown menus and large prompt area
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Input, Dropdown } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { useBook } from '@/context/BookContext';
import { generatePreview } from '@/services/api';
import {
  AUDIENCE_OPTIONS,
  WRITING_STYLES,
  BOOK_LENGTHS,
  ILLUSTRATION_OPTIONS
} from '@/constants/BookOptions';

export default function CreateBookScreen() {
  const { formData, updateFormData, setCurrentBookId, setPreviewData, setUserEmail } = useBook();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Local state for new fields
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0].value);
  const [style, setStyle] = useState(WRITING_STYLES[0].value);
  const [length, setLength] = useState(BOOK_LENGTHS[1].value); // Default to Standard
  const [illustrations, setIllustrations] = useState(ILLUSTRATION_OPTIONS[0].value);
  const [illustrationCount, setIllustrationCount] = useState(0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.topic.trim()) {
      newErrors.topic = 'Please describe your book topic in detail';
    } else if (formData.topic.trim().length < 20) {
      newErrors.topic = 'Please provide more context (at least 20 characters)';
    }

    if (!formData.userEmail.trim()) {
      newErrors.email = 'Email is required to receive your book';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePreview = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Save email for future use
      await setUserEmail(formData.userEmail);

      // Prepare form data with new fields
      const bookData = {
        ...formData,
        audience,
        style,
        length,
        illustrations,
        illustrationCount: illustrations !== 'none' ? illustrationCount : 0,
      };

      // Call API to generate preview
      const response = await generatePreview(bookData);

      // Store the response
      setCurrentBookId(response.book_id);
      setPreviewData(response);

      // Navigate to preview screen
      router.push(`/preview/${response.book_id}`);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to generate preview. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate price
  const selectedLength = BOOK_LENGTHS.find(l => l.value === length);
  const bookPrice = selectedLength?.priceUSD || 19;
  const illustrationPrice = illustrations !== 'none' ? illustrationCount * 1 : 0;
  const totalPrice = bookPrice + illustrationPrice;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Button
            title=""
            variant="ghost"
            size="small"
            onPress={() => router.back()}
            icon={<Ionicons name="chevron-back" size={24} color={Colors.light.text} />}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Create Your Book</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Dropdown Menus Section */}
          <View style={styles.menusSection}>
            <Text style={styles.sectionTitle}>Book Configuration</Text>
            <View style={styles.menusGrid}>
              <View style={styles.menuHalf}>
                <Dropdown
                  label="Audience"
                  value={audience}
                  options={AUDIENCE_OPTIONS}
                  onChange={setAudience}
                  placeholder="Select audience..."
                />
              </View>
              <View style={styles.menuHalf}>
                <Dropdown
                  label="Writing Style"
                  value={style}
                  options={WRITING_STYLES}
                  onChange={setStyle}
                  placeholder="Select style..."
                />
              </View>
            </View>

            <View style={styles.menusGrid}>
              <View style={styles.menuHalf}>
                <Dropdown
                  label="Book Length"
                  value={length}
                  options={BOOK_LENGTHS}
                  onChange={setLength}
                  placeholder="Select length..."
                />
              </View>
              <View style={styles.menuHalf}>
                <Dropdown
                  label="Illustrations"
                  value={illustrations}
                  options={ILLUSTRATION_OPTIONS}
                  onChange={setIllustrations}
                  placeholder="Select type..."
                />
              </View>
            </View>

            {/* Illustration Count (if not "none") */}
            {illustrations !== 'none' && (
              <View style={styles.illustrationNote}>
                <View style={styles.illustrationHeader}>
                  <Ionicons name="images-outline" size={18} color={Colors.brand.primary} />
                  <Text style={styles.illustrationTitle}>Illustration Pricing</Text>
                </View>
                <Text style={styles.illustrationText}>
                  • 1 cover image is FREE{'\n'}
                  • Additional illustrations: $1 each
                </Text>
                <View style={styles.countSection}>
                  <Text style={styles.countLabel}>Extra illustrations needed:</Text>
                  <View style={styles.countControls}>
                    <Button
                      title="-"
                      variant="outline"
                      size="small"
                      onPress={() => setIllustrationCount(Math.max(0, illustrationCount - 1))}
                      style={styles.countButton}
                    />
                    <Text style={styles.countValue}>{illustrationCount}</Text>
                    <Button
                      title="+"
                      variant="outline"
                      size="small"
                      onPress={() => setIllustrationCount(illustrationCount + 1)}
                      style={styles.countButton}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Large Topic/Prompt Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Describe Your Book Topic</Text>
            <TextInput
              style={[styles.topicInput, errors.topic && styles.inputError]}
              placeholder="Provide as much context as possible about your book topic...

Examples:
• CEOs: 'A business book about scaling startups from 10 to 100 employees, covering hiring, culture, and operations...'
• PhD Students: 'A dissertation on machine learning applications in healthcare, focusing on predictive models for patient outcomes...'
• Authors: 'A marketing book about building an audience on social media, with case studies and actionable strategies...'"
              placeholderTextColor={Colors.light.textMuted}
              value={formData.topic}
              onChangeText={(text) => updateFormData({ topic: text })}
              multiline
              numberOfLines={12}
              textAlignVertical="top"
              autoCapitalize="sentences"
            />
            {errors.topic && (
              <Text style={styles.errorText}>{errors.topic}</Text>
            )}
            <View style={styles.promptHelper}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.brand.primary} />
              <Text style={styles.helperText}>
                The more detailed your description, the better your book will be!
              </Text>
            </View>
            <View style={styles.subscriberNote}>
              <Ionicons name="cloud-upload-outline" size={16} color={Colors.light.textSecondary} />
              <Text style={styles.subscriberText}>
                Monthly subscribers can upload documents (PDFs, Word files) to help create their books.
              </Text>
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.section}>
            <Input
              label="Your Email"
              placeholder="you@example.com"
              value={formData.userEmail}
              onChangeText={(text) => updateFormData({ userEmail: text })}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="done"
            />
            <Text style={styles.helper}>
              You'll preview Chapter 1, then download your completed book in your preferred format. We'll also email you a copy for safekeeping.
            </Text>
          </View>

          {/* Pricing Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Pricing Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Book ({selectedLength?.label.split('(')[0].trim()})</Text>
              <Text style={styles.summaryValue}>${bookPrice}</Text>
            </View>
            {illustrations !== 'none' && illustrationCount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Extra illustrations ({illustrationCount} × $1)</Text>
                <Text style={styles.summaryValue}>${illustrationCount}</Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total (after preview)</Text>
              <Text style={styles.summaryPrice}>${totalPrice}</Text>
            </View>
            <View style={styles.freeNote}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
              <Text style={styles.freeNoteText}>
                Preview is FREE - no payment required
              </Text>
            </View>
          </View>

          {/* Generate Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Generating...' : 'Generate FREE Preview'}
              onPress={handleGeneratePreview}
              size="large"
              fullWidth
              loading={loading}
              disabled={loading}
            />
            <Text style={styles.buttonNote}>
              Takes about 30 seconds to generate
            </Text>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>Step 1 of 4</Text>
            <View style={styles.stepDots}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={styles.stepDot} />
              <View style={styles.stepDot} />
              <View style={styles.stepDot} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  menusSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  menusGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  menuHalf: {
    flex: 1,
  },
  illustrationNote: {
    backgroundColor: Colors.brand.primary + '08',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.brand.primary + '20',
  },
  illustrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  illustrationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.primary,
    marginLeft: 8,
  },
  illustrationText: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  countSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.text,
  },
  countControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countButton: {
    minWidth: 40,
    paddingHorizontal: 12,
  },
  countValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  topicInput: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.light.text,
    minHeight: 200,
    maxHeight: 300,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 4,
    marginLeft: 4,
  },
  promptHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.brand.primary + '08',
    borderRadius: 8,
  },
  helperText: {
    fontSize: 13,
    color: Colors.brand.primary,
    marginLeft: 8,
    flex: 1,
  },
  subscriberNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
  },
  subscriberText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  helper: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 4,
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  summaryPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.brand.primary,
  },
  freeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '15',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  freeNoteText: {
    fontSize: 13,
    color: Colors.light.success,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  buttonNote: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    color: Colors.brand.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
  },
  stepDotActive: {
    backgroundColor: Colors.brand.primary,
    width: 24,
  },
});
