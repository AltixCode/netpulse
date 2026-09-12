import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  Activity,
  ShieldCheck,
  FileSpreadsheet,
  Network,
  Check,
  X,
} from 'lucide-react-native';
import { useNetworkStore } from '../store/useNetworkStore';
import { purchaseLifetime, restorePurchases } from '../services/purchases';
import { useTheme } from '../theme/useTheme';
import { t } from '../i18n';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ visible, onClose }) => {
  const theme = useTheme();
  const { setIsPro } = useNetworkStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setErrorMsg(null);
    try {
      const success = await purchaseLifetime();
      if (success) {
        setIsPro(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
      } else {
        setErrorMsg(t('purchaseError'));
      }
    } catch {
      setErrorMsg(t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setErrorMsg(null);
    try {
      const success = await restorePurchases();
      if (success) {
        setIsPro(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
      } else {
        setErrorMsg(t('noPriorPurchases'));
      }
    } catch {
      setErrorMsg(t('restoreError'));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Activity size={20} color={theme.accent} />,
      title: t('feat1Title'),
      desc: t('feat1Desc'),
    },
    {
      icon: <Network size={20} color="#A855F7" />,
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: theme.background,
            borderTopColor: theme.cardBorder,
            borderTopWidth: 1,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            maxHeight: '90%',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: theme.primaryLight, padding: 8, borderRadius: 12, marginRight: 10 }}>
                <Sparkles size={20} color={theme.primary} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text }}>{t('paywallTitle')}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1, padding: 8, borderRadius: 9999 }}
            >
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Anti-Subscription Banner */}
          <View
            style={{
              backgroundColor: theme.card,
              borderColor: theme.primaryBorder,
              borderWidth: 1.5,
              padding: 16,
              borderRadius: 18,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: theme.primary, marginBottom: 4 }}>
              {t('antiSubTitle')}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text, lineHeight: 20 }}>
              {t('antiSubHeadline')}
            </Text>
          </View>

          {/* Features List */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {features.map((f, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
                <View
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                    borderWidth: 1,
                    padding: 8,
                    borderRadius: 12,
                    marginRight: 12,
                  }}
                >
                  {f.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontSize: 14, fontWeight: '700' }}>{f.title}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 16 }}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {errorMsg && (
            <Text style={{ color: theme.danger, fontSize: 12, textAlign: 'center', marginBottom: 10, fontWeight: '600' }}>
              {errorMsg}
            </Text>
          )}

          {/* Purchase Button */}
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={loading}
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
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16, marginRight: 8 }}>
                  {t('lifetimeAccess')}
                </Text>
                <Check size={18} color="#FFFFFF" strokeWidth={3} />
              </>
            )}
          </TouchableOpacity>

          {/* Restore & Policy Links */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 14 }}>
            <TouchableOpacity onPress={handleRestore} disabled={loading} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, textDecorationLine: 'underline' }}>
                {t('restorePurchases')}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>•</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>{t('oneTimePayment')}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};
