import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Router,
  RefreshCw,
  Search,
  Crown,
  Wifi,
} from 'lucide-react-native';
import { useNetworkStore } from '../src/store/useNetworkStore';
import { scanSubnetDevices } from '../src/engine/subnetScanner';
import { DeviceItemCard } from '../src/components/DeviceItemCard';
import { PaywallModal } from '../src/components/PaywallModal';
import { useTheme } from '../src/theme/useTheme';
import { t } from '../src/i18n';

export default function DevicesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    devices,
    setDevices,
    isScanningSubnet,
    setIsScanningSubnet,
    isPro,
    localIp,
    gatewayIp,
  } = useNetworkStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleStartScan = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsScanningSubnet(true);
      setScanProgress({ current: 0, total: 6 });

      const subnetPrefix = localIp.split('.').slice(0, 3).join('.');
      const scannedDevices = await scanSubnetDevices(subnetPrefix, (current, total) => {
        setScanProgress({ current, total });
      });

      setDevices(scannedDevices);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsScanningSubnet(false);
      setScanProgress(null);
    }
  };

  const filteredDevices = devices.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.ip.toLowerCase().includes(q) ||
      d.vendor.toLowerCase().includes(q) ||
      d.mac.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.background, paddingHorizontal: 20 }}>
      {/* Subnet Info Header */}
      <View
        style={{
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          borderWidth: 1,
          borderRadius: 24,
          padding: 20,
          marginTop: 12,
          marginBottom: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0.25 : 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ backgroundColor: theme.successLight, padding: 10, borderRadius: 14, marginRight: 12 }}>
              <Wifi size={18} color={theme.success} />
            </View>
            <View>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{t('localSubnetRange')}</Text>
              <Text style={{ color: theme.textSecondary, fontFamily: 'monospace', fontSize: 12, marginTop: 2 }}>
                {localIp.split('.').slice(0, 3).join('.')}.0/24
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '600' }}>{t('gateway')}</Text>
            <Text style={{ color: theme.success, fontFamily: 'monospace', fontWeight: '800', fontSize: 13, marginTop: 2 }}>
              {gatewayIp}
            </Text>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          onPress={handleStartScan}
          disabled={isScanningSubnet}
          activeOpacity={0.85}
          style={{
            backgroundColor: theme.success,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 48,
          }}
        >
          {isScanningSubnet ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14, marginLeft: 8 }}>
                {t('sweepingSubnet', {
                  current: scanProgress ? scanProgress.current : 0,
                  total: scanProgress ? scanProgress.total : 6,
                })}
              </Text>
            </View>
          ) : (
            <>
              <RefreshCw size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>
                {devices.length > 0 ? t('rescanDevices') : t('startArpSweep')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Pro Port Scanner Banner */}
      {!isPro && (
        <TouchableOpacity
          onPress={() => setShowPaywall(true)}
          activeOpacity={0.85}
          style={{
            backgroundColor: theme.warningLight,
            borderColor: theme.warning,
            borderWidth: 1,
            padding: 14,
            borderRadius: 18,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 52,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            <Crown size={20} color={theme.warning} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{t('portScannerLocked')}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                {t('portScannerDesc')}
              </Text>
            </View>
          </View>
          <View style={{ backgroundColor: theme.warning, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 }}>
            <Text style={{ color: '#000000', fontWeight: '800', fontSize: 12 }}>{t('unlock')}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Search Filter Bar */}
      {devices.length > 0 && (
        <View
          style={{
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Search size={16} color={theme.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={theme.textMuted}
            style={{
              flex: 1,
              color: theme.text,
              fontSize: 14,
              marginLeft: 10,
              padding: 0,
            }}
          />
        </View>
      )}

      {/* Device List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {devices.length === 0 && !isScanningSubnet ? (
          <View
            style={{
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              borderRadius: 24,
              padding: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginVertical: 24,
            }}
          >
            <View style={{ backgroundColor: theme.primaryLight, padding: 18, borderRadius: 24, marginBottom: 16 }}>
              <Router size={36} color={theme.primary} />
            </View>
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 18, textAlign: 'center' }}>
              {t('noDevicesScanned')}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18, maxWidth: 260 }}>
              {t('noDevicesDesc')}
            </Text>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
              <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {t('discoveredHosts', { count: filteredDevices.length })}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 11 }}>{t('ouiResolved')}</Text>
            </View>

            {filteredDevices.map((device) => (
              <DeviceItemCard key={device.id} device={device} />
            ))}
          </>
        )}
      </ScrollView>

      {/* Paywall Modal */}
      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
