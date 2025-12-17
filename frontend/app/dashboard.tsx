/**
 * AIPhDWriter - Dashboard Screen
 * My Books and user workspace
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, Card } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { useBook } from '@/context/BookContext';
import { Book } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

type TabType = 'myBooks' | 'createNew' | 'account';

export default function DashboardScreen() {
  const { myBooks, loadMyBooks, resetFormData } = useBook();
  const [activeTab, setActiveTab] = useState<TabType>('myBooks');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyBooks();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyBooks();
    setRefreshing(false);
  };

  const handleCreateNew = () => {
    resetFormData();
    router.push('/create');
  };

  const handleBookPress = (book: Book) => {
    if (book.status === 'complete') {
      router.push(`/download/${book.book_id}`);
    } else if (book.status === 'generating') {
      router.push(`/status/${book.book_id}`);
    } else {
      router.push(`/preview/${book.book_id}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TabButton
          title="My Books"
          active={activeTab === 'myBooks'}
          onPress={() => setActiveTab('myBooks')}
        />
        <TabButton
          title="Create New"
          active={activeTab === 'createNew'}
          onPress={() => setActiveTab('createNew')}
        />
        <TabButton
          title="Account"
          active={activeTab === 'account'}
          onPress={() => setActiveTab('account')}
        />
        <View style={styles.tabBarAction}>
          <Button
            title="Generate New Book"
            size="small"
            onPress={handleCreateNew}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.brand.primary}
          />
        }
      >
        {activeTab === 'myBooks' && (
          <>
            {myBooks.length === 0 ? (
              <EmptyState onCreateNew={handleCreateNew} />
            ) : (
              <View style={styles.booksGrid}>
                {myBooks.map((book) => (
                  <BookCard
                    key={book.book_id}
                    book={book}
                    onPress={() => handleBookPress(book)}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'createNew' && (
          <View style={styles.createNewContainer}>
            <LinearGradient
              colors={[Colors.brand.primary, Colors.brand.secondary]}
              style={styles.createNewCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add-circle" size={64} color="#FFFFFF" />
              <Text style={styles.createNewTitle}>Start a New Book</Text>
              <Text style={styles.createNewDescription}>
                Create your next masterpiece with AI assistance
              </Text>
              <Button
                title="Create New Book"
                variant="secondary"
                onPress={handleCreateNew}
                style={styles.createNewButton}
                textStyle={styles.createNewButtonText}
              />
            </LinearGradient>

            <View style={styles.quickTemplates}>
              <Text style={styles.quickTemplatesTitle}>Quick Templates</Text>
              <TemplateCard
                icon="school"
                title="Academic Textbook"
                description="Structured educational content"
              />
              <TemplateCard
                icon="code-slash"
                title="Technical Guide"
                description="Step-by-step tutorials"
              />
              <TemplateCard
                icon="business"
                title="Business Book"
                description="Professional insights & strategies"
              />
            </View>
          </View>
        )}

        {activeTab === 'account' && (
          <View style={styles.accountContainer}>
            <Card style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={32} color={Colors.light.textMuted} />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>Guest User</Text>
                  <Text style={styles.accountEmail}>Sign in to sync your books</Text>
                </View>
              </View>
              <Button
                title="Sign In"
                variant="outline"
                fullWidth
              />
            </Card>

            <View style={styles.accountMenu}>
              <AccountMenuItem icon="settings" title="Settings" />
              <AccountMenuItem icon="help-circle" title="Help & Support" />
              <AccountMenuItem icon="document-text" title="Privacy Policy" />
              <AccountMenuItem icon="information-circle" title="About" />
            </View>

            <View style={styles.accountStats}>
              <Text style={styles.statsTitle}>Your Stats</Text>
              <View style={styles.statsRow}>
                <StatCard
                  value={myBooks.length.toString()}
                  label="Books Created"
                  icon="book"
                />
                <StatCard
                  value={myBooks.filter((b) => b.status === 'complete').length.toString()}
                  label="Completed"
                  icon="checkmark-circle"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <BottomTabButton icon="home" label="Home" onPress={() => router.push('/')} />
        <BottomTabButton icon="library" label="Library" active />
        <View style={styles.bottomTabCenter}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
            <LinearGradient
              colors={[Colors.brand.primary, Colors.brand.secondary]}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <BottomTabButton icon="search" label="Search" />
        <BottomTabButton icon="person" label="Profile" />
      </View>
    </SafeAreaView>
  );
}

// Tab Button Component
function TabButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// Book Card Component
function BookCard({ book, onPress }: { book: Book; onPress: () => void }) {
  const getStatusColor = () => {
    switch (book.status) {
      case 'complete':
        return Colors.light.success;
      case 'generating':
        return Colors.brand.primary;
      case 'failed':
        return Colors.light.error;
      default:
        return Colors.light.textMuted;
    }
  };

  const getStatusLabel = () => {
    switch (book.status) {
      case 'complete':
        return 'Download';
      case 'generating':
        return `${book.progress}%`;
      case 'failed':
        return 'Failed';
      default:
        return 'Preview';
    }
  };

  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress} activeOpacity={0.8}>
      {/* Book Cover */}
      <View style={styles.bookCover}>
        <LinearGradient
          colors={[Colors.brand.primaryLight, Colors.brand.primary]}
          style={styles.bookCoverGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="book" size={32} color="rgba(255,255,255,0.3)" />
        </LinearGradient>
        <View style={styles.bookCoverOverlay}>
          <Text style={styles.bookCoverTitle} numberOfLines={3}>
            {book.title}
          </Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          {book.status === 'generating' ? (
            <View style={styles.progressDot} />
          ) : null}
        </View>
      </View>

      {/* Book Info */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.bookStatus}>{getStatusLabel()}</Text>
      </View>

      {/* Action Button */}
      {book.status === 'complete' && (
        <View style={styles.downloadBadge}>
          <Text style={styles.downloadBadgeText}>Download</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Empty State Component
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={64} color={Colors.light.textMuted} />
      <Text style={styles.emptyTitle}>No Books Yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first AI-generated book in minutes
      </Text>
      <Button title="Create Your First Book" onPress={onCreateNew} />
    </View>
  );
}

// Template Card Component
function TemplateCard({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <TouchableOpacity style={styles.templateCard}>
      <View style={styles.templateIcon}>
        <Ionicons name={icon} size={24} color={Colors.brand.primary} />
      </View>
      <View style={styles.templateInfo}>
        <Text style={styles.templateTitle}>{title}</Text>
        <Text style={styles.templateDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
    </TouchableOpacity>
  );
}

// Account Menu Item Component
function AccountMenuItem({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Ionicons name={icon} size={22} color={Colors.light.textSecondary} />
      <Text style={styles.menuItemText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
    </TouchableOpacity>
  );
}

// Stat Card Component
function StatCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={Colors.brand.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Bottom Tab Button Component
function BottomTabButton({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.bottomTabButton} onPress={onPress}>
      <Ionicons
        name={active ? icon : (`${icon}-outline` as any)}
        size={24}
        color={active ? Colors.brand.primary : Colors.light.textMuted}
      />
      <Text
        style={[
          styles.bottomTabLabel,
          active && styles.bottomTabLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  notificationButton: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.brand.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.brand.primary,
    fontWeight: '600',
  },
  tabBarAction: {
    marginLeft: 'auto',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  bookCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookCover: {
    height: 140,
    position: 'relative',
  },
  bookCoverGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookCoverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bookCoverTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 3,
    left: 3,
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  bookStatus: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  downloadBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  downloadBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createNewContainer: {
    gap: 24,
  },
  createNewCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  createNewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  createNewDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  createNewButton: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
  },
  createNewButtonText: {
    color: Colors.brand.primary,
  },
  quickTemplates: {
    gap: 12,
  },
  quickTemplatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  templateDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  accountContainer: {
    gap: 24,
  },
  accountCard: {
    padding: 20,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  accountEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  accountMenu: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    marginLeft: 12,
  },
  accountStats: {
    gap: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 24,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  bottomTabButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  bottomTabLabel: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginTop: 4,
  },
  bottomTabLabelActive: {
    color: Colors.brand.primary,
  },
  bottomTabCenter: {
    marginTop: -24,
  },
  createButton: {
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
