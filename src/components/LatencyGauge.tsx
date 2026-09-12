import React from 'react';
import { View, Text } from 'react-native';
import { Activity, Zap, ShieldCheck } from 'lucide-react-native';
import { t } from '../i18n';

interface LatencyGaugeProps {
  currentPing: number;
  averagePing: number;
  jitter: number;
  history: number[];
}

export const LatencyGauge: React.FC<LatencyGaugeProps> = ({
  currentPing,
  averagePing,
  jitter,
  history,
}) => {
  const maxPing = Math.max(50, ...history);

  const getQualityColor = (ping: number) => {
    if (ping < 30) return '#34D399'; // Green
    if (ping < 80) return '#FBBF24'; // Amber
    return '#F43F5E'; // Rose
  };

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-5">
      {/* Top Status */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="bg-blue-500/20 p-2 rounded-xl mr-2">
            <Activity size={18} color="#60A5FA" />
          </View>
          <Text className="text-white font-bold text-base">{t('connectionLatency')}</Text>
        </View>
        <View className="flex-row items-center bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
          <Text className="text-emerald-400 text-xs font-semibold">{t('active')}</Text>
        </View>
      </View>

      {/* Main Ping Number */}
      <View className="items-center my-3">
        <View className="flex-row items-baseline">
          <Text
            style={{ color: getQualityColor(currentPing) }}
            className="text-6xl font-mono font-extrabold"
          >
            {currentPing}
          </Text>
          <Text className="text-slate-400 text-xl font-bold ml-1.5 font-mono">ms</Text>
        </View>
        <Text className="text-slate-400 text-xs mt-1">{t('rtt')}</Text>
      </View>

      {/* Real-time Sparkline Bars */}
      <View className="h-14 w-full flex-row items-end justify-between space-x-1 my-3 px-2">
        {history.map((val, idx) => {
          const heightPercent = Math.max(12, Math.min(100, (val / maxPing) * 100));
          return (
            <View
              key={idx}
              style={{ height: `${heightPercent}%` }}
              className="flex-1 bg-blue-500 rounded-t-sm"
            />
          );
        })}
      </View>

      {/* Metrics Row: Average & Jitter */}
      <View className="flex-row justify-between pt-4 border-t border-slate-800">
        <View className="items-center flex-1">
          <Text className="text-slate-500 text-[10px] uppercase font-bold">{t('avgPing')}</Text>
          <Text className="text-white text-base font-mono font-bold mt-0.5">{averagePing} ms</Text>
        </View>

        <View className="w-px h-8 bg-slate-800" />

        <View className="items-center flex-1">
          <Text className="text-slate-500 text-[10px] uppercase font-bold">{t('jitterVariance')}</Text>
          <Text className="text-cyan-400 text-base font-mono font-bold mt-0.5">{jitter} ms</Text>
        </View>
      </View>
    </View>
  );
};
