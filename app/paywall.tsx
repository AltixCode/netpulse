import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  BadgeCheck,
  Activity,
  Network,
  FileSpreadsheet,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react-native';
import { useNetworkStore } from '../src/store/useNetworkStore';
import { usePaywall } from '../src/hooks/usePaywall';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '../src/config/legal';
import { useTheme } from '../src/theme/useTheme';
import { useTabletColumn } from '../src/theme/useTabletColumn';
import { t } from '../src/i18n';

export default function PaywallScreen() {
  const router = useRouter();
  const theme = useTheme();
  const tabletColumn = useTabletColumn();
  const { ctaLabel, loading, errorMsg, handlePurchase, handleRestore } =
    usePaywall(() => router.back());

  const features = [
    // Ad removal leads the list: it is what the store product is named after, and it is the
    // benefit a free user has been feeling rather than reading about.
    {
      icon: <BadgeCheck size={20} color={theme.primary} />,
      title: t('featAdsTitle'),
      desc: t('featAdsDesc'),
    },
    {
      icon: <Activity size={20} color={theme.accent} />,
      title: t('feat1Title'),
      desc: t('feat1Desc'),
    },
    {
      icon: <Network size={20} color={theme.purple} />,
      title: t('feat2Title'),
      desc: t('feat2Desc'),
    },
    {
      icon: <FileSpreadsheet size={20} color={theme.warning} />,
      title: t('feat3Title'),
      desc: t('feat3Desc'),
    },
    {
      icon: <ShieldCheck size={20} color={theme.success} />,
      title: t('feat4Title'),
      desc: t('feat4Desc'),
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.background, paddingHorizontal: 24, paddingVertical: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.primaryLight, padding: 10, borderRadius: 14, marginRight: 10 }}>
            <Sparkles size={20} color={theme.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text }}>{t('paywallTitle')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          // An icon-only button with no label reaches VoiceOver as "button" and
          // nothing else, which on the one control that dismisses a paywall is
          // the worst place for it.
          accessibilityRole="button"
          accessibilityLabel={t('cancel')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1, padding: 8, borderRadius: 9999 }}
        >
          <X size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={tabletColumn}>
        {/* Anti-Subscription Banner */}
        <View
          style={{
            backgroundColor: theme.card,
            borderColor: theme.primaryBorder,
            borderWidth: 1.5,
            padding: 20,
            borderRadius: 20,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: theme.primary, marginBottom: 4 }}>
            {t('antiSubTitle')}
          </Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text, lineHeight: 22 }}>
            {t('antiSubHeadline')}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 8, lineHeight: 18 }}>
            {t('antiSubDesc')}
          </Text>
        </View>

        {/* Features List */}
        <View style={{ gap: 16, marginBottom: 24 }}>
          {features.map((f, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 14,
                  marginRight: 14,
                }}
              >
                {f.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700' }}>{f.title}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 3, lineHeight: 18 }}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {errorMsg && (
          <Text style={{ color: theme.danger, fontSize: 13, textAlign: 'center', marginBottom: 12, fontWeight: '600' }}>
            {errorMsg}
          </Text>
        )}
      </ScrollView>

      {/* Purchase CTA */}
      <View style={{ paddingTop: 12, paddingBottom: 24 }}>
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('lifetimeAccess')}
          accessibilityState={{ disabled: loading, busy: loading }}
          activeOpacity={0.85}
          style={{
            backgroundColor: theme.primary,
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            minHeight: 52,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
            opacity: loading ? 0.65 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <>
              <Text style={{ color: theme.onPrimary, fontWeight: '800', fontSize: 16, marginRight: 8 }}>
                {ctaLabel}
              </Text>
              <Check size={18} color={theme.onPrimary} strokeWidth={3} />
            </>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 14 }}>
          <TouchableOpacity onPress={handleRestore} disabled={loading} accessibilityRole="button" accessibilityLabel={t('restorePurchases')} accessibilityState={{ disabled: loading }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12, textDecorationLine: 'underline' }}>
              {t('restorePurchases')}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>•</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>{t('oneTimePayment')}</Text>
        </View>
        <View className="mt-3 flex-row items-center justify-center gap-5">
          <TouchableOpacity
            onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
            accessibilityRole="link"
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={{ color: theme.textMuted }} className="text-xs underline">
              {t('termsOfUse')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            accessibilityRole="link"
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={{ color: theme.textMuted }} className="text-xs underline">
              {t('privacyPolicy')}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
