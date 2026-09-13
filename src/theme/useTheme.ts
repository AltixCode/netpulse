import { useColorScheme } from 'react-native';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  onPrimaryMuted: string;
  primaryLight: string;
  primaryBorder: string;
  accent: string;
  accentLight: string;
  accentBorder: string;
  warning: string;
  onWarning: string;
  warningLight: string;
  warningBorder: string;
  success: string;
  successLight: string;
  successBorder: string;
  danger: string;
  dangerLight: string;
  dangerBorder: string;
  feature: string;
  shadow: string;
  overlay: string;
  headerBackground: string;
  headerTintColor: string;
  statusBarStyle: 'light' | 'dark';
}

export const useTheme = (): ThemeColors => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    background: isDark ? '#090D16' : '#F8FAFC',
    surface: isDark ? '#111827' : '#FFFFFF',
    card: isDark ? '#131B2E' : '#FFFFFF',
    cardBorder: isDark ? '#1E293B' : '#E2E8F0',
    text: isDark ? '#F8FAFC' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#475569',
    textMuted: isDark ? '#64748B' : '#94A3B8',
    primary: '#3B82F6',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: 'rgba(255, 255, 255, 0.78)',
    primaryLight: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.10)',
    primaryBorder: isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.25)',
    accent: '#06B6D4',
    accentLight: isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.10)',
    accentBorder: isDark ? 'rgba(6, 182, 212, 0.35)' : 'rgba(6, 182, 212, 0.25)',
    warning: '#F59E0B',
    onWarning: '#111827',
    warningLight: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.10)',
    warningBorder: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.25)',
    success: '#10B981',
    successLight: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.10)',
    successBorder: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)',
    danger: '#EF4444',
    dangerLight: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
    dangerBorder: isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.25)',
    feature: '#A855F7',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.65)',
    headerBackground: isDark ? '#090D16' : '#FFFFFF',
    headerTintColor: isDark ? '#F8FAFC' : '#0F172A',
    statusBarStyle: isDark ? 'light' : 'dark',
  };
};
