import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import {
  FileSpreadsheet,
  FileText,
  Crown,
  Lock,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react-native';
import { useNetworkStore } from '../src/store/useNetworkStore';
import {
  generateCsvReport,
  generateTextSummary,
  saveReportFile,
} from '../src/engine/reportEngine';
import { PaywallModal } from '../src/components/PaywallModal';
import { useTheme } from '../src/theme/useTheme';
import { t } from '../src/i18n';

export default function ReportScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { benchmark, localIp, gatewayIp, isPro } = useNetworkStore();
  const [exporting, setExporting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const timestamp = new Date().toLocaleString();

  const getStabilityRating = () => {
    if (benchmark.packetLoss > 0) {
      return {
        label: t('gradeC'),
        desc: t('gradeCDesc'),
        color: theme.danger,
        bg: theme.isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
        border: theme.isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.25)',
        icon: <AlertTriangle size={20} color={theme.danger} />,
      };
    }
    if (benchmark.jitter !== null && benchmark.jitter > 15) {
      return {
        label: t('gradeB'),
        desc: t('gradeBDesc'),
        color: theme.warning,
        bg: theme.isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
        border: theme.isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.25)',
        icon: <AlertTriangle size={20} color={theme.warning} />,
      };
    }
    return {
      label: t('gradeA'),
      desc: t('gradeADesc'),
      color: theme.success,
      bg: theme.isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      border: theme.isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)',
      icon: <CheckCircle2 size={20} color={theme.success} />,
    };
  };

  const rating = getStabilityRating();

  const handleExportCsv = async () => {
    if (!isPro) {
      setShowPaywall(true);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setExporting(true);

      const csvData = generateCsvReport({
        benchmark,
        timestamp,
        localIp,
        gatewayIp,
      });

      const filename = `NetPulse_Audit_${Date.now()}.csv`;
      const filePath = await saveReportFile(filename, csvData);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: t('exportCsvDialog'),
          UTI: 'public.comma-separated-values-text',
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportSummary = async () => {
    if (!isPro) {
      setShowPaywall(true);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setExporting(true);

      const textData = generateTextSummary({
        benchmark,
        timestamp,
        localIp,
        gatewayIp,
      });

      const filename = `NetPulse_Audit_Summary_${Date.now()}.txt`;
      const filePath = await saveReportFile(filename, textData);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/plain',
          dialogTitle: t('exportSummaryDialog'),
          UTI: 'public.plain-text',
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.background, paddingHorizontal: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header Info */}
        <View style={{ marginTop: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={14} color={theme.textMuted} />
              <Text style={{ color: theme.textSecondary, fontFamily: 'monospace', fontSize: 12, marginLeft: 6 }}>
                {timestamp}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.primaryLight,
                borderColor: theme.primaryBorder,
                borderWidth: 1,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 9999,
              }}
            >
              <Text style={{ color: theme.primary, fontFamily: 'monospace', fontSize: 10, fontWeight: '700' }}>
                {t('samplesCount')}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '900', color: theme.text }}>{t('diagnosticAudit')}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
            {t('diagnosticDesc')}
          </Text>
        </View>

        {/* Stability Rating Card */}
        <View
          style={{
            backgroundColor: rating.bg,
            borderColor: rating.border,
            borderWidth: 1.5,
            borderRadius: 22,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            {rating.icon}
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 16, marginLeft: 8 }}>{rating.label}</Text>
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18 }}>{rating.desc}</Text>
        </View>

        {/* 4-Card Metric Grid */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              padding: 16,
              borderRadius: 18,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>{t('avgPing')}</Text>
            <Text style={{ color: theme.text, fontFamily: 'monospace', fontWeight: '900', fontSize: 22, marginTop: 4 }}>
              {benchmark.averagePing}
              <Text style={{ fontSize: 12, color: theme.textMuted }}> ms</Text>
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              padding: 16,
              borderRadius: 18,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>{t('jitterVariance')}</Text>
            <Text style={{ color: theme.warning, fontFamily: 'monospace', fontWeight: '900', fontSize: 22, marginTop: 4 }}>
              ±{benchmark.jitter}
              <Text style={{ fontSize: 12, color: theme.textMuted }}> ms</Text>
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              padding: 16,
              borderRadius: 18,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>{t('packetLoss')}</Text>
            <Text
              style={{
                color: benchmark.packetLoss > 0 ? theme.danger : theme.success,
                fontFamily: 'monospace',
                fontWeight: '900',
                fontSize: 22,
                marginTop: 4,
              }}
            >
              {benchmark.packetLoss}%
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              padding: 16,
              borderRadius: 18,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>{t('cloudflareDns')}</Text>
            <Text style={{ color: theme.primary, fontFamily: 'monospace', fontWeight: '900', fontSize: 22, marginTop: 4 }}>
              {benchmark.cloudflarePing}
              <Text style={{ fontSize: 12, color: theme.textMuted }}> ms</Text>
            </Text>
          </View>
        </View>

        {/* Pro Banner if not Pro */}
        {!isPro && (
          <TouchableOpacity
            onPress={() => setShowPaywall(true)}
            activeOpacity={0.85}
            style={{
              backgroundColor: theme.warningLight,
              borderColor: theme.warning,
              borderWidth: 1,
              padding: 16,
              borderRadius: 18,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 52,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
              <Crown size={20} color={theme.warning} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>{t('exportLocked')}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {t('exportLockedDesc')}
                </Text>
              </View>
            </View>
            <View style={{ backgroundColor: theme.warning, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 }}>
              <Text style={{ color: '#000000', fontWeight: '800', fontSize: 12 }}>{t('unlock')}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Export Actions */}
        <View style={{ gap: 12, marginBottom: 20 }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2, paddingHorizontal: 4 }}>
            {t('exportEvidence')}
          </Text>

          {/* Export CSV Button */}
          <TouchableOpacity
            onPress={handleExportCsv}
            disabled={exporting}
            activeOpacity={0.85}
            style={{
              backgroundColor: theme.primary,
              padding: 16,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 56,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FileSpreadsheet size={22} color="#FFFFFF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{t('exportCsv')}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
                  {t('exportCsvDesc')}
                </Text>
              </View>
            </View>
            {exporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : !isPro ? (
              <Lock size={18} color="rgba(255,255,255,0.7)" />
            ) : (
              <Share2 size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          {/* Export Plain Text Summary */}
          <TouchableOpacity
            onPress={handleExportSummary}
            disabled={exporting}
            activeOpacity={0.85}
            style={{
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              padding: 16,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 56,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FileText size={22} color={theme.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{t('exportSummary')}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {t('exportSummaryDesc')}
                </Text>
              </View>
            </View>
            {exporting ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : !isPro ? (
              <Lock size={18} color={theme.textMuted} />
            ) : (
              <Share2 size={18} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Audit Samples Table Preview */}
        <View
          style={{
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
            borderWidth: 1,
            borderRadius: 22,
            padding: 18,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 15 }}>{t('samplePingHistory')}</Text>
            <Text style={{ color: theme.textMuted, fontFamily: 'monospace', fontSize: 12 }}>{t('targetDns')}</Text>
          </View>

          <View style={{ gap: 8 }}>
            {benchmark.history.map((ping, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: i < benchmark.history.length - 1 ? 1 : 0,
                  borderBottomColor: theme.cardBorder,
                }}
              >
                <Text style={{ color: theme.textSecondary, fontFamily: 'monospace', fontSize: 12 }}>
                  {t('pingNum', { number: i + 1 })}
                </Text>
                <Text style={{ color: theme.text, fontFamily: 'monospace', fontWeight: '800', fontSize: 13 }}>
                  {ping} ms
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Paywall Modal */}
      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
