/**
 * AIPhDWriter - Preview Screen
 * Shows book outline and Chapter 1 preview
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, Card } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { useBook } from '@/context/BookContext';
import { getBookStatus } from '@/services/api';
import { BookOutline, Chapter } from '@/types';

const { width } = Dimensions.get('window');

export default function PreviewScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { previewData, formData } = useBook();
  const [activeTab, setActiveTab] = useState<'outline' | 'chapter'>('outline');
  const [loading, setLoading] = useState(false);

  // Use preview data from context or fetch if not available
  const outline = previewData?.outline;
  const chapter1 = previewData?.chapter_1;
  const price = previewData?.price || 49;

  const handlePurchase = () => {
    router.push(`/payment/${bookId}`);
  };

  const handleModifyOutline = () => {
    // For now, just go back to create screen
    router.back();
  };

  if (!outline) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>Loading preview...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Preview</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Book Title Card */}
        <Card variant="elevated" style={styles.titleCard}>
          <Text style={styles.bookTitle}>{outline.title}</Text>
          {outline.subtitle && (
            <Text style={styles.bookSubtitle}>{outline.subtitle}</Text>
          )}

          {/* Book Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="document-text" size={16} color={Colors.brand.primary} />
              <Text style={styles.statText}>
                {outline.estimatedPages || `~${outline.chapters.length * 15}`} pages
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="pricetag" size={16} color={Colors.brand.primary} />
              <Text style={styles.statText}>${price}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="time" size={16} color={Colors.brand.primary} />
              <Text style={styles.statText}>~5 min read</Text>
            </View>
          </View>
        </Card>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'outline' && styles.tabActive]}
            onPress={() => setActiveTab('outline')}
          >
            <Text style={[styles.tabText, activeTab === 'outline' && styles.tabTextActive]}>
              Table of Contents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chapter' && styles.tabActive]}
            onPress={() => setActiveTab('chapter')}
          >
            <Text style={[styles.tabText, activeTab === 'chapter' && styles.tabTextActive]}>
              Chapter 1
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'outline' ? (
          <View style={styles.outlineContainer}>
            {outline.chapters.map((chapter, index) => (
              <ChapterItem
                key={index}
                chapter={chapter}
                isFirst={index === 0}
                isUnlocked={index === 0}
              />
            ))}
          </View>
        ) : (
          <View style={styles.chapterContainer}>
            <Card style={styles.chapterCard}>
              <Text style={styles.chapterTitle}>Chapter 1</Text>
              <Text style={styles.chapterSubtitle}>
                {outline.chapters[0]?.title || 'Introduction'}
              </Text>
              <View style={styles.chapterDivider} />
              <Text style={styles.chapterContent}>{chapter1}</Text>
            </Card>
          </View>
        )}

        {/* Locked Content Notice */}
        {activeTab === 'outline' && outline.chapters.length > 1 && (
          <Card style={styles.lockedNotice}>
            <Ionicons name="lock-closed" size={24} color={Colors.brand.primary} />
            <Text style={styles.lockedTitle}>
              {outline.chapters.length - 1} more {outline.chapters.length - 1 === 1 ? 'chapter' : 'chapters'} locked
            </Text>
            <Text style={styles.lockedDescription}>
              Purchase to unlock all chapters and download your complete book
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Modify Outline"
          variant="outline"
          onPress={handleModifyOutline}
          style={styles.modifyButton}
          icon={<Ionicons name="create-outline" size={18} color={Colors.brand.primary} />}
        />
        <Button
          title={`Purchase for $${price}`}
          onPress={handlePurchase}
          style={styles.purchaseButton}
        />
      </View>
    </SafeAreaView>
  );
}

// Chapter Item Component
function ChapterItem({
  chapter,
  isFirst,
  isUnlocked,
}: {
  chapter: Chapter;
  isFirst: boolean;
  isUnlocked: boolean;
}) {
  return (
    <View style={[styles.chapterItem, isFirst && styles.chapterItemFirst]}>
      <View style={styles.chapterNumber}>
        {isUnlocked ? (
          <Text style={styles.chapterNumberText}>{chapter.number}</Text>
        ) : (
          <Ionicons name="lock-closed" size={14} color={Colors.light.textMuted} />
        )}
      </View>
      <View style={styles.chapterInfo}>
        <Text style={[styles.chapterItemTitle, !isUnlocked && styles.chapterLocked]}>
          {chapter.title}
        </Text>
        {chapter.focus && (
          <Text style={styles.chapterFocus} numberOfLines={2}>
            {chapter.focus}
          </Text>
        )}
      </View>
      {isFirst && (
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>Preview</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
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
    paddingBottom: 100,
  },
  titleCard: {
    marginBottom: 20,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    lineHeight: 32,
  },
  bookSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.light.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: Colors.brand.primary,
    fontWeight: '600',
  },
  outlineContainer: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  chapterItemFirst: {
    backgroundColor: Colors.brand.primary + '08',
  },
  chapterNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chapterNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.primary,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  chapterLocked: {
    color: Colors.light.textMuted,
  },
  chapterFocus: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  previewBadge: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chapterContainer: {
    marginBottom: 20,
  },
  chapterCard: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chapterSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 4,
  },
  chapterDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 16,
  },
  chapterContent: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.light.text,
  },
  lockedNotice: {
    alignItems: 'center',
    backgroundColor: Colors.brand.primary + '08',
    marginTop: 20,
    padding: 24,
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 12,
  },
  lockedDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  modifyButton: {
    flex: 0.4,
  },
  purchaseButton: {
    flex: 0.6,
  },
});
