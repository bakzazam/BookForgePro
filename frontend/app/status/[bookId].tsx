/**
 * AIPhDWriter - Status/Progress Screen
 * Beautiful animated progress tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ProgressCircle } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { useBook } from '@/context/BookContext';
import { getBookStatus } from '@/services/api';

const { width } = Dimensions.get('window');

export default function StatusScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { previewData, updateBook } = useBook();
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [status, setStatus] = useState<'generating' | 'complete' | 'failed'>('generating');
  const [estimatedTime, setEstimatedTime] = useState(5);

  const totalChapters = previewData?.outline?.totalChapters || 10;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Poll for status updates
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await getBookStatus(bookId!);
        setProgress(response.progress);
        setCurrentChapter(response.current_chapter || Math.ceil(response.progress / (100 / totalChapters)));
        setStatus(response.status as any);

        // Update remaining time estimate
        const remaining = Math.ceil((100 - response.progress) / 20);
        setEstimatedTime(Math.max(1, remaining));

        // Update book in storage
        updateBook(bookId!, {
          status: response.status,
          progress: response.progress,
        });

        if (response.status === 'complete') {
          // Navigate to download screen
          setTimeout(() => {
            router.replace(`/download/${bookId}`);
          }, 1500);
        } else if (response.status === 'failed') {
          // Handle failure
        }
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 3 seconds
    interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [bookId]);

  // Chapter completion indicators
  const chapters = Array.from({ length: totalChapters }, (_, i) => {
    const chapterNum = i + 1;
    const chapterProgress = (chapterNum / totalChapters) * 100;
    const isComplete = progress >= chapterProgress;
    const isCurrent = currentChapter === chapterNum;
    return { number: chapterNum, isComplete, isCurrent };
  });

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <ProgressCircle
              progress={progress}
              size={220}
              strokeWidth={14}
              backgroundColor="rgba(255, 255, 255, 0.15)"
              progressColor="#FFFFFF"
            />
          </View>

          {/* Status Text */}
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Ionicons name="book" size={32} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.statusText}>
                Generating Chapter {currentChapter} of {totalChapters}...
              </Text>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Ionicons name="sparkles" size={28} color="#FCD34D" />
              </Animated.View>
            </View>
            <Text style={styles.estimatedTime}>
              Estimated Completion: {estimatedTime} minute{estimatedTime !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Chapter Progress */}
          <View style={styles.chaptersSection}>
            <Text style={styles.chaptersTitle}>Progress Timeline</Text>
            <View style={styles.chapterIndicators}>
              {chapters.slice(0, 10).map((chapter) => (
                <View
                  key={chapter.number}
                  style={[
                    styles.chapterIndicator,
                    chapter.isComplete && styles.chapterComplete,
                    chapter.isCurrent && styles.chapterCurrent,
                  ]}
                >
                  {chapter.isComplete ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.chapterNumber}>{chapter.number}</Text>
                  )}
                </View>
              ))}
              {totalChapters > 10 && (
                <Text style={styles.moreChapters}>+{totalChapters - 10}</Text>
              )}
            </View>
          </View>

          {/* Book Info */}
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {previewData?.outline?.title || 'Your Book'}
            </Text>
          </View>

          {/* Bottom Message */}
          <View style={styles.bottomMessage}>
            <Text style={styles.messageText}>
              Your book will be ready soon.
            </Text>
            <Text style={styles.subMessageText}>
              Feel free to leave this screen - we'll notify you when it's done.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  progressContainer: {
    marginBottom: 40,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  estimatedTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  chaptersSection: {
    width: '100%',
    marginBottom: 40,
  },
  chaptersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
    textAlign: 'center',
  },
  chapterIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  chapterIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chapterComplete: {
    backgroundColor: Colors.light.success,
  },
  chapterCurrent: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  chapterNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  moreChapters: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    alignSelf: 'center',
    marginLeft: 4,
  },
  bookInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  bottomMessage: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subMessageText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 4,
  },
});
