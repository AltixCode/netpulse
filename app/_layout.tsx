import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, View } from 'react-native';
import { Crown } from 'lucide-react-native';
import { initPurchases, checkIsPro } from '../src/services/purchases';
import { useNetworkStore } from '../src/store/useNetworkStore';
import { useTheme } from '../src/theme/useTheme';
import { t } from '../src/i18n';
import '../global.css';

export default function RootLayout() {
  const router = useRouter();
  const { isPro, setIsPro } = useNetworkStore();
  const theme = useTheme();

  useEffect(() => {
    initPurchases();
    checkIsPro().then((pro) => setIsPro(pro));
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
            !isPro ? (
              <TouchableOpacity
                onPress={() => router.push('/paywall')}
                accessibilityRole="button"
                accessibilityLabel={t('paywallTitle')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                <Crown size={14} color={theme.warning} />
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
            title: t('paywallTitle'),
            presentation: 'modal',
          }}
        />
      </Stack>
    </View>
  );
}
