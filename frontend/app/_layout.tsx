import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { BookProvider } from '@/context/BookContext';
import { Colors } from '@/constants/Colors';

// Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_dSonhEvnshpX1wimfhOI3TDp';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.brand.primary,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
    },
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <BookProvider>
        <ThemeProvider value={customTheme}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.light.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="create" />
            <Stack.Screen
              name="preview/[bookId]"
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="payment/[bookId]"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="status/[bookId]"
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen name="download/[bookId]" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </BookProvider>
    </StripeProvider>
  );
}
