import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  Router,
  FileSpreadsheet,
  RefreshCw,
  Globe,
  ShieldCheck,
} from 'lucide-react-native';
import { useNetworkStore } from '../src/store/useNetworkStore';
import { runNetworkBenchmark } from '../src/engine/pingEngine';
import { LatencyGauge } from '../src/components/LatencyGauge';
import { useTheme } from '../src/theme/useTheme';
import { useTabletColumn } from '../src/theme/useTabletColumn';
import { t } from '../src/i18n';
import { ForwardArrow } from '../src/components/DirectionalIcons';
import { AdBanner } from '../src/components/AdBanner';
import { useAdsStore } from '../src/store/adsStore';
import { showPrivacyOptionsForm } from '../src/services/ads';
import { showInterstitial } from '../src/services/ads';
import { shouldShowInterstitial } from '../src/services/adPolicy';

export default function HomeScreen() {
  // Google requires a persistent entry back into the consent form wherever UMP reports that
  // privacy options are available, which in practice means the EEA and the regulated US
  // states. It is absent everywhere else rather than shown as a dead control.
  const offerPrivacyOptions = useAdsStore((state) => state.consent.offerPrivacyOptions);
  const router = useRouter();
  const theme = useTheme();
  const tabletColumn = useTabletColumn();
  const [benchmarkFailed, setBenchmarkFailed] = useState(false);
  const {
    benchmark,
    isBenchmarking,
    setBenchmark,
    setIsBenchmarking,
  } = useNetworkStore();

  const maybeShowInterstitial = async () => {
    const { completions, lastInterstitialAt, markInterstitialShown } = useAdsStore.getState();
    const decision = shouldShowInterstitial({
      completions,
      lastInterstitialAt,
      now: Date.now(),
      // Read at call time rather than captured: the user may have bought the upgrade from the
      // paywall between opening this screen and finishing the work.
      isPro: useNetworkStore.getState().isPro,
    });
    if (!decision) return;
    // Only a shown-and-dismissed ad resets the clock. Counting an unfilled request would
    // suppress the next several ads for nothing.
    if (await showInterstitial()) await markInterstitialShown();
  };

  const handleRunTest = async () => {
    try {
      setBenchmarkFailed(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // The ad goes here, before the next test starts, rather than after one finishes: results
      // are the whole point of the screen, and covering them the moment they appear is the
      // worst possible place for an interruption. A test the user has just asked for is a
      // pause they are already waiting through.
      await maybeShowInterstitial();
      setIsBenchmarking(true);

      const result = await runNetworkBenchmark(benchmark.history);
      setBenchmark(result);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await useAdsStore.getState().recordCompletion();
    } catch {
      setBenchmarkFailed(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.background, paddingHorizontal: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 , ...tabletColumn}}>
        {/* Header Hero */}
        <View style={{ marginTop: 12, marginBottom: 20 }}>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: theme.primaryLight,
              borderColor: theme.primaryBorder,
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 9999,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Sparkles size={13} color={theme.primary} />
            <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
              {t('heroBadge')}
            </Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
            {t('heroTitle')}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
            {t('heroSubtitle')}
          </Text>
        </View>

        {/* Latency Gauge & Sparkline Component */}
        <LatencyGauge
          currentPing={benchmark.currentPing}
          averagePing={benchmark.averagePing}
          jitter={benchmark.jitter}
          history={benchmark.history}
        />

        {/* Retest CTA */}
        <TouchableOpacity
          onPress={handleRunTest}
          disabled={isBenchmarking}
          accessibilityRole="button"
          accessibilityLabel={t('benchmarkNow')}
          accessibilityState={{ disabled: isBenchmarking, busy: isBenchmarking }}
          activeOpacity={0.85}
          style={{
            backgroundColor: theme.primary,
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            minHeight: 52,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
            opacity: isBenchmarking ? 0.65 : 1,
          }}
        >
          {isBenchmarking ? (
            <ActivityIndicator size="small" color={theme.onPrimary} />
          ) : (
            <>
              <RefreshCw size={18} color={theme.onPrimary} />
              <Text style={{ color: theme.onPrimary, fontWeight: '800', fontSize: 16, marginLeft: 8 }}>
                {t('benchmarkNow')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {benchmarkFailed && (
          <Text accessibilityRole="alert" style={{ color: theme.danger, marginTop: -8, marginBottom: 20, textAlign: 'center', fontWeight: '600' }}>
            {t('error')}
          </Text>
        )}

        {/* DNS Comparison Grid */}
        <View
          style={{
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
            borderWidth: 1,
            borderRadius: 24,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Globe size={18} color={theme.primary} />
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
              {t('dnsBackbone')}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: theme.background,
                borderColor: theme.cardBorder,
                borderWidth: 1,
                padding: 14,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>Cloudflare 1.1.1.1</Text>
              <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', marginVertical: 4 }}>
                {benchmark.cloudflarePing ?? t("notMeasured")} ms
              </Text>
              <Text style={{ color: theme.success, fontSize: 11, fontWeight: '600' }}>{t('primaryResolver')}</Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: theme.background,
                borderColor: theme.cardBorder,
                borderWidth: 1,
                padding: 14,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>Google 8.8.8.8</Text>
              <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', marginVertical: 4 }}>
                {benchmark.googlePing ?? t("notMeasured")} ms
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '500' }}>{t('secondaryFallback')}</Text>
            </View>
          </View>
        </View>

        {/* Navigation Action Cards */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          {/* Subnet Scanner Card */}
          <TouchableOpacity
            onPress={() => router.push('/devices')}
            accessibilityRole="button"
            accessibilityLabel={t('subnetCardTitle')}
            activeOpacity={0.8}
            style={{
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              padding: 16,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 64,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
              <View style={{ backgroundColor: theme.successLight, padding: 12, borderRadius: 16, marginRight: 14 }}>
                <Router size={22} color={theme.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{t('subnetCardTitle')}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
                  {t('subnetCardDesc')}
                </Text>
              </View>
            </View>
            <ForwardArrow size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* ISP Audit Report Card */}
          <TouchableOpacity
            onPress={() => router.push('/report')}
            accessibilityRole="button"
            accessibilityLabel={t('ispCardTitle')}
            activeOpacity={0.8}
            style={{
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              padding: 16,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 64,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
              <View style={{ backgroundColor: theme.warningLight, padding: 12, borderRadius: 16, marginRight: 14 }}>
                <FileSpreadsheet size={22} color={theme.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{t('ispCardTitle')}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
                  {t('ispCardDesc')}
                </Text>
              </View>
            </View>
            <ForwardArrow size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Architectural Guarantees */}
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: theme.textMuted, marginBottom: 10 }}>
            {t('auditGuarantees')}
          </Text>

          <View
            style={{
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              padding: 16,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ backgroundColor: theme.primaryLight, padding: 10, borderRadius: 14, marginRight: 14 }}>
              <ShieldCheck size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{t('offlineOui')}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
                {t('offlineOuiDesc')}
              </Text>
            </View>
          </View>
        </View>
        {offerPrivacyOptions ? (
          <TouchableOpacity
            onPress={() => {
              void showPrivacyOptionsForm();
            }}
            accessibilityRole="button"
            className="mt-2 py-3 items-center"
            style={{ minHeight: 44 }}
          >
            <Text className="text-xs font-semibold underline" style={{ color: theme.textSecondary }}>
              {t('adPrivacySettings')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
      {/* Anchored below the scroll area rather than inside it: a banner that scrolls with the
          content can sit under a finger reaching for the button above it. */}
      <AdBanner />
    </SafeAreaView>
  );
}
