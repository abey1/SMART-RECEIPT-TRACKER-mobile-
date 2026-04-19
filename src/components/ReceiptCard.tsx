import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../config/theme';
import type { Receipt } from '../types';

type Props = {
  receipt: Receipt;
  onPress?: () => void;
  compact?: boolean;
};

function formatDateLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ReceiptCard({ receipt, onPress, compact }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: receipt.imageUri }}
        style={[styles.thumb, compact && styles.thumbGrid]}
        resizeMode="cover"
      />
      {!compact && (
        <View style={styles.meta}>
          <Text style={styles.date}>{formatDateLabel(receipt.date)}</Text>
          <Text style={styles.id} numberOfLines={1}>
            {receipt.id.slice(0, 8)}…
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  pressed: { opacity: 0.94 },
  thumb: {
    width: '100%',
    height: 140,
    backgroundColor: colors.border,
  },
  thumbGrid: {
    width: '100%',
    aspectRatio: 1,
  },
  meta: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  date: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 15,
  },
  id: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
