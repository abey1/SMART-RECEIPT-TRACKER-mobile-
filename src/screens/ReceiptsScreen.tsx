import { useLayoutEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { ReceiptCard } from '../components/ReceiptCard';
import { colors, radius, spacing } from '../config/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useReceiptStore } from '../store/useReceiptStore';
import type { Receipt, ReceiptViewMode } from '../types';

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatSectionTitle(day: string): string {
  try {
    const d = new Date(day + 'T12:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return day;
  }
}

export function ReceiptsScreen() {
  const navigation = useNavigation();
  const receipts = useReceiptStore((s) => s.receipts);
  const signOut = useAuthStore((s) => s.signOut);
  const [viewMode, setViewMode] = useState<ReceiptViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => signOut()} hitSlop={12} style={styles.headerRow}>
          <Text style={styles.headerBtn}>Sign out</Text>
        </Pressable>
      ),
    });
  }, [navigation, signOut]);

  const availableDates = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((r) => set.add(dayKey(r.date)));
    return Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  }, [receipts]);

  const filtered = useMemo(() => {
    let list = [...receipts];
    if (selectedDate) {
      list = list.filter((r) => dayKey(r.date) === selectedDate);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const day = formatSectionTitle(dayKey(r.date)).toLowerCase();
        return r.id.toLowerCase().includes(q) || day.includes(q);
      });
    }
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [receipts, selectedDate, searchQuery]);

  const sections = useMemo(() => {
    const map = new Map<string, Receipt[]>();
    filtered.forEach((r) => {
      const k = dayKey(r.date);
      const cur = map.get(k) ?? [];
      cur.push(r);
      map.set(k, cur);
    });
    const keys = Array.from(map.keys()).sort((a, b) => (a < b ? 1 : -1));
    return keys.map((k) => ({
      title: formatSectionTitle(k),
      data: map.get(k) ?? [],
    }));
  }, [filtered]);

  const openDatePicker = () => {
    setDateModalVisible(true);
  };

  const listHeader = (
    <View style={styles.toolbarCol}>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search receipts…"
        placeholderTextColor={colors.textSecondary}
        style={styles.textSearch}
        clearButtonMode="while-editing"
      />
      <View style={styles.toolbar}>
      <Pressable
        style={styles.searchShell}
        onPress={openDatePicker}
        accessibilityRole="button"
      >
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.searchText}>
          {selectedDate
            ? formatSectionTitle(selectedDate)
            : 'Filter by date — tap to choose'}
        </Text>
        {selectedDate ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              setSelectedDate(null);
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </Pressable>
      <Pressable
        style={styles.toggle}
        onPress={() => setViewMode((m) => (m === 'list' ? 'grid' : 'list'))}
      >
        <Ionicons
          name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}
          size={22}
          color={colors.primary}
        />
      </Pressable>
      </View>
    </View>
  );

  if (viewMode === 'grid') {
    return (
      <View style={styles.container}>
        {listHeader}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          ListEmptyComponent={
            <Text style={styles.empty}>No receipts for this filter yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.gridCell}>
              <ReceiptCard receipt={item} compact />
            </View>
          )}
        />
        <Modal
          visible={dateModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDateModalVisible(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setDateModalVisible(false)}
          >
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Choose a date</Text>
              <Pressable
                style={styles.modalRow}
                onPress={() => {
                  setSelectedDate(null);
                  setDateModalVisible(false);
                }}
              >
                <Text style={styles.modalRowText}>All dates</Text>
              </Pressable>
              {availableDates.map((d) => (
                <Pressable
                  key={d}
                  style={styles.modalRow}
                  onPress={() => {
                    setSelectedDate(d);
                    setDateModalVisible(false);
                  }}
                >
                  <Text style={styles.modalRowText}>{formatSectionTitle(d)}</Text>
                </Pressable>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {listHeader}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ReceiptCard receipt={item} />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No receipts for this filter yet.</Text>
        }
      />
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDateModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Choose a date</Text>
            <Pressable
              style={styles.modalRow}
              onPress={() => {
                setSelectedDate(null);
                setDateModalVisible(false);
              }}
            >
              <Text style={styles.modalRowText}>All dates</Text>
            </Pressable>
            {availableDates.map((d) => (
              <Pressable
                key={d}
                style={styles.modalRow}
                onPress={() => {
                  setSelectedDate(d);
                  setDateModalVisible(false);
                }}
              >
                <Text style={styles.modalRowText}>{formatSectionTitle(d)}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { paddingRight: spacing.sm },
  headerBtn: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  toolbarCol: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  textSearch: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  searchText: { flex: 1, fontSize: 14, color: colors.text },
  toggle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  listContent: { paddingBottom: spacing.xl },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardWrap: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  gridContent: { padding: spacing.md, paddingBottom: spacing.xl },
  row: { gap: spacing.md },
  gridCell: { flex: 1, maxWidth: '50%' },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.text,
  },
  modalRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalRowText: { fontSize: 16, color: colors.text },
});
