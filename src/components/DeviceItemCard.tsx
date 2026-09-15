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

  // Icon follows the advertised service type. MAC-prefix vendor lookup is not
  // possible here: iOS cannot read a neighbour's hardware address without a
  // special entitlement, which is why the previous vendor names were invented.
  const getDeviceIcon = () => {
    const service = device.service.toLowerCase();
    if (service.includes('_airplay') || service.includes('_raop') || service.includes('_googlecast')) {
      return <Smartphone size={20} color={theme.success} />;
    }
    if (service.includes('_ssh') || service.includes('_rfb') || service.includes('_workstation')) {
      return <Laptop size={20} color={theme.textSecondary} />;
    }
    if (service.includes('_hap') || service.includes('_homekit')) {
      return <Cpu size={20} color={theme.warning} />;
    }
    return <Router size={20} color={theme.primary} />;
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
            <Text
              style={{ color: theme.text, fontWeight: '800', fontSize: 14, marginRight: 8, flex: 1 }}
              numberOfLines={1}
            >
              {device.name}
            </Text>
          </View>

          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 2 }} numberOfLines={1}>
            {device.category}
          </Text>
          <Text
            style={{ color: theme.textMuted, fontFamily: 'monospace', fontSize: 10, marginTop: 2 }}
            numberOfLines={1}
          >
            {device.service}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            color: device.latencyMs === null ? theme.textMuted : theme.success,
            fontFamily: 'monospace',
            fontSize: 13,
            fontWeight: '800',
          }}
        >
          {device.latencyMs === null ? t('notMeasured') : `${Math.round(device.latencyMs)} ms`}
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
