import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Facebook from 'expo-auth-session/providers/facebook';

import { env } from '../config/env';
import { colors, radius, spacing } from '../config/theme';
import { buildUserFromOAuth } from '../services/oauthUser';
import type { User } from '../types';

type Props = {
  onSuccess: (user: User) => void;
  label?: string;
};

export function FacebookSignInButton({
  onSuccess,
  label = 'Continue with Facebook',
}: Props) {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: env.facebookAppId,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const token = response.authentication?.accessToken;
      buildUserFromOAuth('facebook', token)
        .then(onSuccess)
        .catch((e: Error) => Alert.alert('Facebook sign-in', e.message));
    } else if (response.type === 'error') {
      Alert.alert(
        'Facebook sign-in',
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
        <Text style={styles.icon}>f</Text>
        {disabled ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#1877F2',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: {
    fontWeight: '800',
    fontSize: 20,
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
