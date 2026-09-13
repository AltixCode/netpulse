import React from 'react';
import { View, Text } from 'react-native';
import { Router, Smartphone, Laptop, Cpu } from 'lucide-react-native';
import { SubnetDevice } from '../engine/subnetScanner';
import { useTheme } from '../theme/useTheme';
import { t } from '../i18n';

interface DeviceItemCardProps {
  device: SubnetDevice;
}

export const DeviceItemCard: React.FC<DeviceItemCardProps> = ({ device }) => {
  const theme = useTheme();

  const getDeviceIcon = () => {
    if (device.isGateway) return <Router size={20} color={theme.primary} />;
    if (device.vendor.includes('Apple') || device.vendor.includes('Samsung')) {
      return <Smartphone size={20} color={theme.success} />;
    }
    if (device.vendor.includes('Raspberry') || device.vendor.includes('Espressif')) {
      return <Cpu size={20} color={theme.warning} />;
    }
    return <Laptop size={20} color={theme.textSecondary} />;
  };

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderColor: theme.cardBorder,
        borderWidth: 1,
        padding: 16,
        borderRadius: 18,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0.2 : 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
        <View
          style={{
            backgroundColor: theme.background,
            borderColor: theme.cardBorder,
            borderWidth: 1,
            padding: 10,
            borderRadius: 14,
            marginRight: 12,
          }}
        >
          {getDeviceIcon()}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: theme.text, fontFamily: 'monospace', fontWeight: '800', fontSize: 14, marginRight: 8 }}>
              {device.ip}
            </Text>
            {device.isGateway && (
              <View
                style={{
                  backgroundColor: theme.primaryLight,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: theme.primary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>
                  {t('router')}
                </Text>
              </View>
            )}
          </View>

          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 2 }} numberOfLines={1}>
            {device.vendor}
          </Text>
          <Text style={{ color: theme.textMuted, fontFamily: 'monospace', fontSize: 10, marginTop: 2 }}>
            MAC: {device.mac}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: theme.success, fontFamily: 'monospace', fontSize: 13, fontWeight: '800' }}>
          {device.latencyMs} ms
        </Text>
        {device.openPorts && device.openPorts.length > 0 && (
          <Text style={{ color: theme.textMuted, fontFamily: 'monospace', fontSize: 10, marginTop: 2 }}>
            Ports: {device.openPorts.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
};
