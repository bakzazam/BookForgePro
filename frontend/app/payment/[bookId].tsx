/**
 * BookForgePro - Payment Screen
 * Secure Stripe payment integration (from Rork's implementation)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStripe, CardField } from '@stripe/stripe-react-native';

import { Button, Card } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { useBook } from '@/context/BookContext';
import { createPaymentIntent, confirmPurchase } from '@/services/api';

export default function PaymentScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { previewData, formData, addBook } = useBook();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [email, setEmail] = useState('');
  const [extraIllustrations, setExtraIllustrations] = useState(0);

  const { confirmPayment } = useStripe();

  const outline = previewData?.outline;
  const basePrice = previewData?.price || 19;

  // Calculate total with extra illustrations
  const illustrationsTotal = extraIllustrations * 1; // $1 per extra illustration
  const total = basePrice + illustrationsTotal;

  const handlePayment = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address to receive your book.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!cardComplete) {
      Alert.alert('Card Required', 'Please enter your card details to continue.');
      return;
    }

    setProcessingPayment(true);
    try {
      console.log('[Payment] Creating payment intent...');

      // Create payment intent (add extra_illustration add-ons)
      const addOns = [];
      for (let i = 0; i < extraIllustrations; i++) {
        addOns.push('extra_illustration');
      }

      const paymentIntent = await createPaymentIntent(bookId!, addOns);
      console.log('[Payment] Client secret received:', paymentIntent.client_secret);

      // Confirm payment with Stripe
      console.log('[Payment] Confirming payment with Stripe...');
      const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await confirmPayment(
        paymentIntent.client_secret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (confirmError) {
        console.error('[Payment] Stripe confirmation error:', confirmError);
        throw new Error(confirmError.message);
      }

      const finalPaymentIntentId =
        confirmedPaymentIntent?.id ||
        paymentIntent.client_secret.split('_secret_')[0];

      console.log('[Payment] Payment confirmed successfully');
      console.log('[Payment] Using payment intent ID:', finalPaymentIntentId);

      // Confirm purchase with backend
      const result = await confirmPurchase(
        bookId!,
        finalPaymentIntentId,
        email,
        addOns
      );

      if (result.success) {
        console.log('[Payment] Purchase confirmed:', result);

        // Add to my books
        addBook({
          book_id: bookId!,
          title: outline?.title || 'Untitled Book',
          topic: formData.topic,
          status: 'generating',
          progress: 0,
          created_at: new Date().toISOString(),
          paid: true,
          price: total,
          outline: outline,
        });

        // Navigate to status screen
        router.replace(`/status/${bookId}`);
      }
    } catch (error: any) {
      console.error('[Payment] Payment failed:', error);

      let errorMessage = 'Failed to process payment';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Payment Failed', errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Your Purchase</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Book Summary */}
        <Card variant="outlined" style={styles.bookCard}>
          <Text style={styles.bookLabel}>Book Information</Text>
          <Text style={styles.bookTitle}>{outline?.title || 'Your Book'}</Text>
          <Text style={styles.bookDetails}>
            {outline?.chapters?.length || outline?.totalChapters || 10} chapters · {formData.length} length
          </Text>
        </Card>

        {/* Email Input */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Email</Text>
          <Text style={styles.sectionSubtitle}>
            Where should we send your completed book?
          </Text>
          <View style={styles.emailInputContainer}>
            <Ionicons name="mail" size={20} color="#666" style={styles.emailIcon} />
            <TextInput
              style={styles.emailInput}
              placeholder="your@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Card>

        {/* Extra Illustrations */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Extra Illustrations</Text>
          <Text style={styles.sectionSubtitle}>
            1 cover image is FREE. Add more illustrations at $1 each.
          </Text>
          <View style={styles.illustrationCounter}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setExtraIllustrations(Math.max(0, extraIllustrations - 1))}
            >
              <Ionicons name="remove" size={24} color={Colors.brand.primary} />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{extraIllustrations}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setExtraIllustrations(extraIllustrations + 1)}
            >
              <Ionicons name="add" size={24} color={Colors.brand.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Payment Information */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <Text style={styles.sectionSubtitle}>
            Enter your card details securely
          </Text>
          <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={{
              backgroundColor: '#f9f9f9',
              textColor: '#1a1a2e',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e0e0e0',
            }}
            style={styles.cardField}
            onCardChange={(cardDetails) => {
              console.log('[Payment] Card complete:', cardDetails.complete);
              setCardComplete(cardDetails.complete);
            }}
          />
          <Text style={styles.testCardHint}>
            Test card: 4242 4242 4242 4242 (any future date, any CVC)
          </Text>
        </Card>

        {/* Price Breakdown */}
        <Card style={styles.priceCard}>
          <Text style={styles.priceTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Book ({formData.length})</Text>
            <Text style={styles.priceValue}>${basePrice}</Text>
          </View>
          {extraIllustrations > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Extra Illustrations ({extraIllustrations}× $1)
              </Text>
              <Text style={styles.priceValue}>${illustrationsTotal}</Text>
            </View>
          )}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.light.success} />
          <Text style={styles.securityText}>
            Secure payment powered by Stripe
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalValue}>${total.toFixed(2)}</Text>
        </View>
        <Button
          title={processingPayment ? 'Processing...' : `Pay $${total} & Generate Book`}
          onPress={handlePayment}
          size="large"
          fullWidth
          loading={processingPayment}
          disabled={processingPayment || !cardComplete || !email.trim()}
        />
        <View style={styles.guaranteeRow}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
          <Text style={styles.guaranteeText}>100% Satisfaction Guarantee</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 200,
  },
  bookCard: {
    marginBottom: 20,
  },
  bookLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 4,
  },
  bookDetails: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  emailIcon: {
    marginRight: 12,
  },
  emailInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1a1a2e',
  },
  illustrationCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    minWidth: 40,
    textAlign: 'center',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 16,
  },
  testCardHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  priceCard: {
    marginBottom: 20,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.brand.primary,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  securityText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  bottomTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomTotalLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  bottomTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  guaranteeText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});
