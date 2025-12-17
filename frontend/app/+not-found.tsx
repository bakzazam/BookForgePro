import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
      <View style={styles.content}>
        <Ionicons name="alert-circle-outline" size={80} color={Colors.light.textMuted} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>
          The page you're looking for doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Button title="Go to Home" />
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});
