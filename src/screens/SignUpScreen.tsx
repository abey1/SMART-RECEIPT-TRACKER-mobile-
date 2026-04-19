import { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';

import { FacebookSignInButton } from '../components/FacebookSignInButton';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { isFacebookOAuthConfigured, isGoogleOAuthConfigured } from '../config/env';
import { colors, radius, spacing } from '../config/theme';
import type { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import type { User } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Sign up', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Sign up', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const user: User = {
        id: Crypto.randomUUID(),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        provider: 'email',
      };
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = useCallback(
    (user: User) => {
      setUser(user);
    },
    [setUser]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.sub}>
            Local-first receipts — cloud sync can plug in later.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Alex Johnson"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@company.com"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 8 characters"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="Repeat password"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </View>

          <PrimaryButton
            title="Sign up"
            onPress={() => void handleSignUp()}
            loading={loading}
          />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          {isGoogleOAuthConfigured() ? (
            <GoogleSignInButton onSuccess={handleOAuth} />
          ) : (
            <Text style={styles.hint}>
              Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to enable Google sign-in.
            </Text>
          )}

          <View style={{ height: spacing.md }} />

          {isFacebookOAuthConfigured() ? (
            <FacebookSignInButton onSuccess={handleOAuth} />
          ) : (
            <Text style={styles.hint}>
              Add EXPO_PUBLIC_FACEBOOK_APP_ID to enable Facebook sign-in.
            </Text>
          )}

          <Text style={styles.footer}>
            Already registered?{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('SignIn')}
            >
              Sign in
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  sub: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.sm },
  field: { gap: spacing.xs },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: { textAlign: 'center', marginTop: spacing.lg, color: colors.textSecondary },
  link: { color: colors.primary, fontWeight: '700' },
});
