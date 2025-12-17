/**
 * AIPhDWriter - Download Screen
 * Book completion and download options
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';

import { Button, Card } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { useBook } from '@/context/BookContext';
import { getDownloadUrl, getBookStatus } from '@/services/api';

const API_BASE_URL = 'https://api.k9appbuilder.com';

type DownloadFormat = 'pdf' | 'docx' | 'epub';

interface FormatOption {
  id: DownloadFormat;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Best for printing and sharing',
    icon: 'document-text',
    color: '#EF4444',
  },
  {
    id: 'docx',
    name: 'DOCX',
    description: 'Editable in Microsoft Word',
    icon: 'create',
    color: '#3B82F6',
  },
  {
    id: 'epub',
    name: 'EPUB',
    description: 'Perfect for e-readers',
    icon: 'book',
    color: '#6B7280',
  },
];

export default function DownloadScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { previewData, updateBook } = useBook();
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});

  // Success animation
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate success checkmark
    Animated.sequence([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Fetch download URLs
    fetchDownloadUrls();
  }, []);

  const fetchDownloadUrls = async () => {
    try {
      const status = await getBookStatus(bookId!);
      if (status.download_urls) {
        setDownloadUrls(status.download_urls);
      }
    } catch (error) {
      console.error('Failed to fetch download URLs:', error);
    }
  };

  const handleDownload = async (format: DownloadFormat) => {
    setDownloading(format);
    try {
      // Use direct URL or fetch from API
      const url = downloadUrls[format] || `${API_BASE_URL}/api/download/${bookId}?format=${format}`;

      // Open in browser (will trigger download)
      await WebBrowser.openBrowserAsync(url);
    } catch (error: any) {
      Alert.alert(
        'Download Failed',
        error.message || 'Unable to download. Please try again.'
      );
    } finally {
      setDownloading(null);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just created "${previewData?.outline?.title || 'an amazing book'}" using AIPhDWriter! Check it out at aiphdwriter.com`,
        title: 'Share Your Book',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleCreateAnother = () => {
    router.replace('/create');
  };

  const handleGoToDashboard = () => {
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Success Header */}
      <LinearGradient
        colors={[Colors.light.success, '#059669']}
        style={styles.successHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.checkmarkContainer,
            { transform: [{ scale: checkmarkScale }] },
          ]}
        >
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.successTitle}>Your Book is Ready!</Text>
        <Text style={styles.successSubtitle}>
          {previewData?.outline?.title || 'Your Book'}
        </Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        {/* Download Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Download Complete</Text>
          <Text style={styles.sectionDescription}>
            Choose your preferred format
          </Text>

          <View style={styles.downloadOptions}>
            {FORMAT_OPTIONS.map((format) => (
              <DownloadOption
                key={format.id}
                format={format}
                onPress={() => handleDownload(format.id)}
                loading={downloading === format.id}
              />
            ))}
          </View>
        </View>

        {/* Share Section */}
        <Card style={styles.shareCard}>
          <View style={styles.shareContent}>
            <Ionicons name="share-social" size={24} color={Colors.brand.primary} />
            <View style={styles.shareText}>
              <Text style={styles.shareTitle}>Share Your Achievement</Text>
              <Text style={styles.shareDescription}>
                Let others know about your new book!
              </Text>
            </View>
          </View>
          <Button
            title="Share"
            variant="outline"
            size="small"
            onPress={handleShare}
          />
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Create Another Book"
            onPress={handleCreateAnother}
            fullWidth
            icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
          />
          <Button
            title="Go to My Books"
            variant="outline"
            onPress={handleGoToDashboard}
            fullWidth
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// Download Option Component
function DownloadOption({
  format,
  onPress,
  loading,
}: {
  format: FormatOption;
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.downloadOption}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      <View style={[styles.formatIcon, { backgroundColor: format.color + '15' }]}>
        <Ionicons
          name={format.icon as any}
          size={24}
          color={format.color}
        />
      </View>
      <View style={styles.formatInfo}>
        <Text style={styles.formatName}>{format.name}</Text>
        <Text style={styles.formatDescription}>{format.description}</Text>
      </View>
      {loading ? (
        <View style={styles.downloadingIndicator}>
          <Text style={styles.downloadingText}>...</Text>
        </View>
      ) : (
        <Ionicons name="download-outline" size={24} color={Colors.brand.primary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  successHeader: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 20,
  },
  downloadOptions: {
    gap: 12,
  },
  downloadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  formatInfo: {
    flex: 1,
  },
  formatName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  formatDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  downloadingIndicator: {
    padding: 4,
  },
  downloadingText: {
    fontSize: 18,
    color: Colors.brand.primary,
  },
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  shareContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shareText: {
    marginLeft: 12,
    flex: 1,
  },
  shareTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  shareDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  actions: {
    gap: 12,
    marginTop: 'auto',
  },
});
