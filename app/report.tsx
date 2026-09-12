import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import {
  FileSpreadsheet,
  FileText,
  Activity,
  ShieldCheck,
  Crown,
  Lock,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { useNetworkStore } from '../src/store/useNetworkStore';
import {
  generateCsvReport,
  generateTextSummary,
  saveReportFile,
} from '../src/engine/reportEngine';
import { PaywallModal } from '../src/components/PaywallModal';
import { t } from '../src/i18n';

export default function ReportScreen() {
  const router = useRouter();
  const { benchmark, localIp, gatewayIp, isPro } = useNetworkStore();
  const [exporting, setExporting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const timestamp = new Date().toLocaleString();

  const getStabilityRating = () => {
    if (benchmark.packetLoss > 0) {
      return {
        label: t('gradeC'),
        desc: t('gradeCDesc'),
        color: '#EF4444',
        bg: 'bg-red-500/10 border-red-500/30',
        icon: <AlertTriangle size={18} color="#EF4444" />,
      };
    }
    if (benchmark.jitter > 15) {
      return {
        label: t('gradeB'),
        desc: t('gradeBDesc'),
        color: '#F59E0B',
        bg: 'bg-amber-500/10 border-amber-500/30',
        icon: <AlertTriangle size={18} color="#F59E0B" />,
      };
    }
    return {
      label: t('gradeA'),
      desc: t('gradeADesc'),
      color: '#10B981',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: <CheckCircle2 size={18} color="#10B981" />,
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
    <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-950 px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header Info */}
        <View className="mt-3 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Clock size={14} color="#94A3B8" />
              <Text className="text-slate-400 font-mono text-xs ml-1.5">{timestamp}</Text>
            </View>
            <View className="bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              <Text className="text-blue-400 font-mono text-[10px] font-bold">{t('samplesCount')}</Text>
            </View>
          </View>
          <Text className="text-2xl font-extrabold text-white">{t('diagnosticAudit')}</Text>
          <Text className="text-slate-400 text-xs mt-1">
            {t('diagnosticDesc')}
          </Text>
        </View>

        {/* Stability Rating Card */}
        <View className={`border rounded-3xl p-5 mb-4 ${rating.bg}`}>
          <View className="flex-row items-center mb-2">
            {rating.icon}
            <Text className="text-white font-bold text-base ml-2">{rating.label}</Text>
          </View>
          <Text className="text-slate-300 text-xs leading-relaxed">{rating.desc}</Text>
        </View>

        {/* 4-Card Metric Grid */}
        <View className="flex-row space-x-3 mb-3">
          <View className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl mr-1.5">
            <Text className="text-slate-400 text-xs font-semibold">{t('avgPing')}</Text>
            <Text className="text-white font-mono font-bold text-2xl mt-1">
              {benchmark.averagePing}
              <Text className="text-xs text-slate-400"> ms</Text>
            </Text>
          </View>

          <View className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl ml-1.5">
            <Text className="text-slate-400 text-xs font-semibold">{t('jitterVariance')}</Text>
            <Text className="text-amber-400 font-mono font-bold text-2xl mt-1">
              ±{benchmark.jitter}
              <Text className="text-xs text-slate-400"> ms</Text>
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-3 mb-5">
          <View className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl mr-1.5">
            <Text className="text-slate-400 text-xs font-semibold">{t('packetLoss')}</Text>
            <Text
              className={`font-mono font-bold text-2xl mt-1 ${
                benchmark.packetLoss > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {benchmark.packetLoss}%
            </Text>
          </View>

          <View className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl ml-1.5">
            <Text className="text-slate-400 text-xs font-semibold">{t('cloudflareDns')}</Text>
            <Text className="text-blue-400 font-mono font-bold text-2xl mt-1">
              {benchmark.cloudflarePing}
              <Text className="text-xs text-slate-400"> ms</Text>
            </Text>
          </View>
        </View>

        {/* Pro Banner if not Pro */}
        {!isPro && (
          <TouchableOpacity
            onPress={() => setShowPaywall(true)}
            activeOpacity={0.85}
            className="bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/30 p-4 rounded-2xl mb-5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Crown size={20} color="#F59E0B" />
              <View className="ml-2.5 flex-1">
                <Text className="text-white font-bold text-sm">{t('exportLocked')}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  {t('exportLockedDesc')}
                </Text>
              </View>
            </View>
            <View className="bg-amber-500/20 px-3 py-1.5 rounded-full">
              <Text className="text-amber-400 font-bold text-xs">{t('unlock')}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Export Actions */}
        <View className="space-y-3 mb-5">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 px-1">
            {t('exportEvidence')}
          </Text>

          {/* Export CSV Button */}
          <TouchableOpacity
            onPress={handleExportCsv}
            disabled={exporting}
            activeOpacity={0.85}
            className="bg-blue-600 active:bg-blue-500 p-4 rounded-2xl flex-row items-center justify-between shadow-lg shadow-blue-500/20 mb-3"
          >
            <View className="flex-row items-center">
              <FileSpreadsheet size={20} color="#FFFFFF" />
              <View className="ml-3">
                <Text className="text-white font-bold text-base">{t('exportCsv')}</Text>
                <Text className="text-blue-200 text-xs">
                  {t('exportCsvDesc')}
                </Text>
              </View>
            </View>
            {exporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : !isPro ? (
              <Lock size={18} color="#93C5FD" />
            ) : (
              <Share2 size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          {/* Export Plain Text / Markdown Summary */}
          <TouchableOpacity
            onPress={handleExportSummary}
            disabled={exporting}
            activeOpacity={0.85}
            className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <FileText size={20} color="#60A5FA" />
              <View className="ml-3">
                <Text className="text-white font-bold text-base">{t('exportSummary')}</Text>
                <Text className="text-slate-400 text-xs">
                  {t('exportSummaryDesc')}
                </Text>
              </View>
            </View>
            {exporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : !isPro ? (
              <Lock size={18} color="#94A3B8" />
            ) : (
              <Share2 size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>
        </View>

        {/* Audit Samples Table Preview */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-bold text-sm">{t('samplePingHistory')}</Text>
            <Text className="text-slate-500 font-mono text-xs">{t('targetDns')}</Text>
          </View>

          <View className="space-y-2">
            {benchmark.history.map((ping, i) => (
              <View
                key={i}
                className="flex-row items-center justify-between py-1.5 border-b border-slate-800/60"
              >
                <Text className="text-slate-400 font-mono text-xs">
                  {t('pingNum', { number: i + 1 })}
                </Text>
                <Text className="text-white font-mono font-bold text-xs">{ping} ms</Text>
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
