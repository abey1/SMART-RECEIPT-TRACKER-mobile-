import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';

import { env } from '../config/env';
import { colors, radius, spacing } from '../config/theme';
import { buildUserFromOAuth } from '../services/oauthUser';
import type { User } from '../types';

type Props = {
  onSuccess: (user: User) => void;
  label?: string;
};

export function GoogleSignInButton({ onSuccess, label = 'Continue with Google' }: Props) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId || undefined,
    androidClientId: env.googleAndroidClientId || undefined,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const token = response.authentication?.accessToken;
      buildUserFromOAuth('google', token)
        .then(onSuccess)
        .catch((e: Error) => Alert.alert('Google sign-in', e.message));
    } else if (response.type === 'error') {
      Alert.alert(
        'Google sign-in',
        response.error?.message ?? 'Something went wrong'
      );
    }
  }, [response, onSuccess]);

  const disabled = !request;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      disabled={disabled}
      onPress={() => promptAsync()}
    >
      <View style={styles.row}>
        <Text style={styles.icon}>G</Text>
        {disabled ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: {
    fontWeight: '700',
    fontSize: 18,
    color: '#4285F4',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
