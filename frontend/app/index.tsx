/**
 * BookForgePro - Home/Landing Screen
 * Beautiful landing page matching the mockups
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Button } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { useBook } from '@/context/BookContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { setUserEmail, loadMyBooks } = useBook();
  // TODO: Replace with Clerk authentication in future session
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  useEffect(() => {
    // Load saved email on app start
    const loadSavedData = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        if (savedEmail) {
          setUserEmail(savedEmail);
        }
        await loadMyBooks();
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    };
    loadSavedData();
  }, []);

  const handleGetStarted = () => {
    router.push('/create');
  };

  const handleViewDashboard = () => {
    router.push('/dashboard');
  };

  const handleAuth = () => {
    // TODO: Integrate Clerk authentication
    // For now, just navigate to a placeholder or show alert
    console.log('Sign In / Sign Up clicked - Clerk integration pending');
    // Future: router.push('/auth') or trigger Clerk modal
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          {isLoggedIn ? (
            <Button
              title="My Books"
              variant="ghost"
              size="small"
              onPress={handleViewDashboard}
            />
          ) : (
            <Button
              title="Sign In / Sign Up"
              variant="ghost"
              size="small"
              onPress={handleAuth}
            />
          )}
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/hero-banner.png')}
            style={styles.heroBanner}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)']}
            style={styles.heroOverlay}
          >
            <View style={styles.heroContent}>
              <Button
                title="Get Started FREE"
                variant="secondary"
                size="large"
                onPress={handleGetStarted}
                style={styles.heroButton}
                textStyle={styles.heroButtonText}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why BookForgePro?</Text>

          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="flash"
              title="Lightning Fast"
              description="Generate a complete book in under 5 minutes"
            />
            <FeatureCard
              icon="ribbon"
              title="Professional Quality"
              description="PhD-level content, perfectly formatted"
            />
            <FeatureCard
              icon="settings"
              title="Customizable"
              description="Choose style, length, and audience"
            />
            <FeatureCard
              icon="download"
              title="Multiple Formats"
              description="Download as PDF, DOCX, or EPUB"
            />
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.stepsContainer}>
            <StepCard
              number="1"
              title="Describe Your Book"
              description="Tell us your topic, audience, and preferences"
            />
            <View style={styles.stepConnector} />
            <StepCard
              number="2"
              title="Preview for FREE"
              description="See outline and Chapter 1 before you pay"
            />
            <View style={styles.stepConnector} />
            <StepCard
              number="3"
              title="Download & Publish"
              description="Get your complete book in minutes"
            />
          </View>
        </View>

        {/* Pricing Preview */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Simple Pricing</Text>
          <Text style={styles.pricingSubtitle}>
            Preview is always FREE. Pay only when you love it.
          </Text>

          <View style={styles.pricingCards}>
            <PricingPreviewCard
              name="Short"
              price="$29"
              chapters="5-7"
              words="15K-25K"
            />
            <PricingPreviewCard
              name="Standard"
              price="$49"
              chapters="8-12"
              words="30K-50K"
              featured
            />
            <PricingPreviewCard
              name="Comprehensive"
              price="$99"
              chapters="15-20"
              words="60K-80K"
            />
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={[Colors.brand.primary, Colors.brand.secondary]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaTitle}>Ready to Write Your Book?</Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of authors who have published with AI
            </Text>
            <Button
              title="Create Your Book Now"
              variant="secondary"
              size="large"
              onPress={handleGetStarted}
              style={styles.ctaButton}
              textStyle={styles.ctaButtonText}
            />
          </LinearGradient>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by BookForgePro AI Model. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color={Colors.brand.primary} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

// Step Card Component
function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.stepCard}>
      <LinearGradient
        colors={[Colors.brand.primary, Colors.brand.secondary]}
        style={styles.stepNumber}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.stepNumberText}>{number}</Text>
      </LinearGradient>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  );
}

// Pricing Preview Card Component
function PricingPreviewCard({
  name,
  price,
  chapters,
  words,
  featured = false,
}: {
  name: string;
  price: string;
  chapters: string;
  words: string;
  featured?: boolean;
}) {
  return (
    <View style={[styles.pricingCard, featured && styles.pricingCardFeatured]}>
      {featured && (
        <LinearGradient
          colors={[Colors.brand.primary, Colors.brand.secondary]}
          style={styles.pricingCardBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.pricingCardBadgeText}>Popular</Text>
        </LinearGradient>
      )}
      <Text style={styles.pricingCardName}>{name}</Text>
      <Text style={styles.pricingCardPrice}>{price}</Text>
      <Text style={styles.pricingCardDetails}>{chapters} chapters</Text>
      <Text style={styles.pricingCardDetails}>{words} words</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  heroContainer: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    height: 350,
  },
  heroBanner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
    padding: 32,
    paddingBottom: 48,
    justifyContent: 'flex-end',
  },
  heroContent: {
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 12,
    lineHeight: 24,
  },
  heroButton: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: Colors.brand.primary,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  stepsContainer: {
    alignItems: 'center',
  },
  stepCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: Colors.light.border,
  },
  pricingSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  pricingSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: -16,
  },
  pricingCards: {
    flexDirection: 'row',
    gap: 12,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  pricingCardFeatured: {
    backgroundColor: Colors.brand.primary + '10',
    borderWidth: 2,
    borderColor: Colors.brand.primary,
  },
  pricingCardBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  pricingCardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pricingCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  pricingCardPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 4,
  },
  pricingCardDetails: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  ctaGradient: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  ctaButton: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
  },
  ctaButtonText: {
    color: Colors.brand.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  footerCopyright: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 4,
  },
});
