/**
 * PricingCard Component for AIPhDWriter
 * Used for selecting book length/pricing tier
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { PricingTier } from '../../types';

interface PricingCardProps {
  tier: PricingTier;
  selected: boolean;
  onPress: () => void;
}

export function PricingCard({ tier, selected, onPress }: PricingCardProps) {
  const getGradientColors = () => {
    switch (tier.id) {
      case 'short':
        return [Colors.pricing.short, Colors.pricing.short];
      case 'standard':
        return [Colors.pricing.standard, Colors.pricing.standard];
      case 'comprehensive':
        return [Colors.pricing.comprehensive, Colors.pricing.comprehensive];
      case 'dissertation':
        return [Colors.pricing.dissertation, Colors.pricing.dissertation];
      default:
        return [Colors.brand.primary, Colors.brand.primary];
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, selected && styles.containerSelected]}
      activeOpacity={0.7}
    >
      {selected && (
        <LinearGradient
          colors={getGradientColors()}
          style={styles.selectedBorder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <View style={styles.content}>
        <Text style={[styles.price, selected && styles.priceSelected]}>
          ${tier.price}
        </Text>
        <Text style={[styles.name, selected && styles.nameSelected]}>
          {tier.name}
        </Text>
        <Text style={styles.details}>
          {tier.chapters} chapters
        </Text>
        <Text style={styles.words}>
          {tier.words} words
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface PricingCardGroupProps {
  tiers: PricingTier[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function PricingCardGroup({
  tiers,
  selectedId,
  onChange,
}: PricingCardGroupProps) {
  return (
    <View style={styles.group}>
      {tiers.map((tier) => (
        <PricingCard
          key={tier.id}
          tier={tier}
          selected={selectedId === tier.id}
          onPress={() => onChange(tier.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerSelected: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.light.card,
  },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  content: {
    padding: 12,
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  priceSelected: {
    color: Colors.brand.primary,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  nameSelected: {
    color: Colors.brand.primary,
  },
  details: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginTop: 4,
  },
  words: {
    fontSize: 10,
    color: Colors.light.textMuted,
  },
  group: {
    flexDirection: 'row',
    gap: 8,
  },
});
