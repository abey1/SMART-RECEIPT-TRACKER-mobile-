import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../config/theme';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Greeting'>;

export function GreetingScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[StyleSheet.absoluteFill, styles.gradient]} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Finance</Text>
          </View>
          <Text style={styles.title}>Smart Receipt Tracker</Text>
          <Text style={styles.subtitle}>
            Capture receipts, organize by day, and understand your spending at a
            glance.
          </Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton
            title="Create account"
            onPress={() => navigation.navigate('SignUp')}
          />
          <Pressable
            onPress={() => navigation.navigate('SignIn')}
            style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.linkLabel}>I already have an account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: {
    backgroundColor: colors.primaryDark,
  },
  safe: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between' },
  hero: { marginTop: spacing.xl * 2, gap: spacing.md },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeText: { color: '#e0f2f1', fontWeight: '600', fontSize: 12 },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.85)',
  },
  actions: { gap: spacing.md, marginBottom: spacing.xl },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkLabel: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
