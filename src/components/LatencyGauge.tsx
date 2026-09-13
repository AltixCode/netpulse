import React from 'react';
import { View, Text } from 'react-native';
import { Activity } from 'lucide-react-native';
import { useTheme } from '../theme/useTheme';
import { t } from '../i18n';

interface LatencyGaugeProps {
  /** Null until a probe has actually answered. */
  currentPing: number | null;
  averagePing: number | null;
  jitter: number | null;
  history: number[];
}

export const LatencyGauge: React.FC<LatencyGaugeProps> = ({
  currentPing,
  averagePing,
  jitter,
  history,
}) => {
  const theme = useTheme();
  const maxPing = Math.max(50, ...history);

  const getQualityColor = (ping: number) => {
    if (ping < 30) return theme.success;
    if (ping < 80) return theme.warning;
    return theme.danger;
  };

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderColor: theme.cardBorder,
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: theme.isDark ? 0.3 : 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Top Status */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: theme.primaryLight,
              padding: 8,
              borderRadius: 12,
              marginRight: 10,
            }}
          >
            <Activity size={18} color={theme.primary} />
          </View>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>
            {t('connectionLatency')}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.successLight,
            borderColor: theme.success,
            borderWidth: 1,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.success, marginRight: 6 }} />
          <Text style={{ color: theme.success, fontSize: 12, fontWeight: '600' }}>
            {t('active')}
          </Text>
        </View>
      </View>

      {/* Main Ping Number */}
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              color: currentPing === null ? '#94A3B8' : getQualityColor(currentPing),
              fontSize: 56,
              fontWeight: '900',
              fontVariant: ['tabular-nums'],
              letterSpacing: -1,
            }}
          >
            {currentPing ?? t('notMeasured')}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 20,
              fontWeight: '700',
              marginLeft: 6,
            }}
          >
            ms
          </Text>
        </View>
        <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 4, fontWeight: '500' }}>
          {t('rtt')}
        </Text>
      </View>

      {/* Real-time Sparkline Bars */}
      <View
        style={{
          height: 56,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginVertical: 12,
          paddingHorizontal: 4,
        }}
      >
        {history.map((val, idx) => {
          const heightPercent = Math.max(12, Math.min(100, (val / maxPing) * 100));
          return (
            <View
              key={idx}
              style={{
                height: `${heightPercent}%`,
                flex: 1,
                backgroundColor: theme.primary,
                marginHorizontal: 1.5,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                opacity: 0.85,
              }}
            />
          );
        })}
      </View>

      {/* Metrics Row: Average & Jitter */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: theme.cardBorder,
        }}
      >
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase', fontWeight: '700' }}>
            {t('avgPing')}
          </Text>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800', marginTop: 4 }}>
            {averagePing ?? t('notMeasured')} ms
          </Text>
        </View>

        <View style={{ width: 1, height: 32, backgroundColor: theme.cardBorder }} />

        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase', fontWeight: '700' }}>
            {t('jitterVariance')}
          </Text>
          <Text style={{ color: theme.accent, fontSize: 16, fontWeight: '800', marginTop: 4 }}>
            {jitter ?? t('notMeasured')} ms
          </Text>
        </View>
      </View>
    </View>
  );
};
