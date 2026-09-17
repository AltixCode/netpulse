import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox, Text, TouchableOpacity, View } from 'react-native';
import { Crown } from 'lucide-react-native';
import { initPurchases, checkIsPro } from '../src/services/purchases';
import { initializeAds } from '../src/services/ads';
import { useAdsStore } from '../src/store/adsStore';
import { useNetworkStore } from '../src/store/useNetworkStore';
import { useTheme } from '../src/theme/useTheme';
import { t } from '../src/i18n';
import '../global.css';

/**
 * No LogBox toast in a capture build.
 *
 * Dropping the RevenueCat log level to ERROR silences its chatter but not its
 * errors -- and in a simulator the errors are unavoidable, because there is no
 * StoreKit for it to reach. React Native draws that as a toast docked at the
 * bottom of the screen, photographed on a 13" iPad sitting across a purchase
 * button. No log level can prevent it, because the error is real.
 *
 * Gated on `__DEV__` and the capture flag together: an ordinary debug build
 * keeps its warnings, a release build never reaches it.
 */
if (__DEV__ && process.env.EXPO_PUBLIC_CAPTURE_MODE === '1') {
  LogBox.ignoreAllLogs(true);
}

export default function RootLayout() {
  const router = useRouter();
  const { isPro, setIsPro } = useNetworkStore();
  const theme = useTheme();

  useEffect(() => {
    void useAdsStore.getState().hydrate();
    initPurchases();
    // Ads start only once entitlement is known, and only for users who have not bought the
    // upgrade. Running the consent flow first would put a GDPR form -- and on iOS an ATT
    // prompt -- in front of someone who has already paid never to see an ad.
    void checkIsPro().then((pro) => {
      setIsPro(pro);
      if (!pro) void initializeAds();
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.statusBarStyle} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.headerTintColor,
          headerTitleStyle: { fontWeight: '700', color: theme.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
          headerRight: () =>
            // No background or border of our own: iOS 26+ already draws a
            // container behind header bar items, and adding one produced a
            // visible double border.
            !isPro ? (
              <TouchableOpacity
                onPress={() => router.push('/paywall')}
                accessibilityRole="button"
                accessibilityLabel={t('paywallTitle')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{
                  backgroundColor: theme.warningLight,
                  borderColor: theme.warning,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 9999,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Crown size={15} color={theme.warning} />
                <Text style={{ color: theme.warning, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                  {t('proBadge')}
                </Text>
              </TouchableOpacity>
            ) : null,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: t('appName'),
            headerTitleAlign: 'left',
          }}
        />
        <Stack.Screen
          name="devices"
          options={{
            title: t('subnetDevicesTitle'),
            headerBackTitle: t('back'),
          }}
        />
        <Stack.Screen
          name="report"
          options={{
            title: t('ispAuditTitle'),
            headerBackTitle: t('back'),
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            // No navigation header: the paywall draws its own title row, with
            // the icon and the close button, immediately beneath it. Both were
            // showing, so every one of these apps rendered its paywall title
            // twice about 60pt apart -- visible in any paywall screenshot the
            // app ever ships. The sheet keeps drag-to-dismiss, and the in-sheet
            // close button calls `router.back()`, so nothing is lost with the
            // header gone.
            headerShown: false,
            presentation: 'modal',
            // Inherited from screenOptions otherwise, which let the paywall
            // push another copy of itself without limit.
            headerRight: () => null,
          }}
        />
      </Stack>
    </View>
  );
}
