import { useLayoutEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

import { MetricCard } from '../components/MetricCard';
import { colors, radius, spacing } from '../config/theme';
import { useAuthStore } from '../store/useAuthStore';
import { useReceiptStore } from '../store/useReceiptStore';
import type { DateRangePreset } from '../types';

const chartConfig = {
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(13, 148, 136, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
  propsForDots: { r: '4' },
};

function daysForPreset(preset: DateRangePreset): number {
  switch (preset) {
    case '2w':
      return 14;
    case '3w':
      return 21;
    case '1m':
    default:
      return 30;
  }
}

function mockDailySpend(labels: string[]): number[] {
  return labels.map((_, i) => Math.round(20 + Math.sin(i / 2) * 15 + i * 2));
}

export function AnalysisScreen() {
  const navigation = useNavigation();
  const signOut = useAuthStore((s) => s.signOut);
  const receipts = useReceiptStore((s) => s.receipts);
  const [range, setRange] = useState<DateRangePreset>('2w');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => signOut()} hitSlop={12}>
          <Text style={styles.headerBtn}>Sign out</Text>
        </Pressable>
      ),
    });
  }, [navigation, signOut]);

  const { totalSpend, receiptCount, labels, spendSeries } = useMemo(() => {
    const days = daysForPreset(range);
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);

    const inRange = receipts.filter((r) => {
      const t = new Date(r.date).getTime();
      return t >= start.getTime() && t <= now.getTime();
    });

    const labelCount = Math.min(7, days);
    const chartLabels: string[] = [];
    for (let i = labelCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * Math.floor(days / labelCount));
      chartLabels.push(
        d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
      );
    }

    const mockSeries = mockDailySpend(chartLabels);
    const total = mockSeries.reduce((a, b) => a + b, 0);

    return {
      totalSpend: total,
      receiptCount: inRange.length,
      labels: chartLabels,
      spendSeries: mockSeries,
    };
  }, [range, receipts]);

  const screenW = Dimensions.get('window').width - spacing.lg * 2;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Spending overview</Text>
      <Text style={styles.screenSub}>
        Mock chart data for layout; totals blend your receipt counts with demo
        curves.
      </Text>

      <View style={styles.segment}>
        {(
          [
            ['2w', 'Last 2 weeks'],
            ['3w', 'Last 3 weeks'],
            ['1m', 'Last month'],
          ] as const
        ).map(([key, label]) => (
          <Pressable
            key={key}
            style={[styles.segBtn, range === key && styles.segBtnActive]}
            onPress={() => setRange(key)}
          >
            <Text style={[styles.segLabel, range === key && styles.segLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          title="Total spending (mock)"
          value={`$${totalSpend.toLocaleString()}`}
          subtitle="Demo curve — connect real totals from OCR later"
        />
        <MetricCard
          title="Receipts in range"
          value={`${receiptCount}`}
          subtitle="From your saved receipts"
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Daily trend</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: spendSeries.length ? spendSeries : [0] }],
          }}
          width={screenW}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.aiCard}>
        <Text style={styles.aiTitle}>AI insights</Text>
        <Text style={styles.aiBody}>
          When you connect a backend, this panel can summarize categories, flag
          unusual spend, and compare periods. For now it is a styled placeholder.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.lg },
  headerBtn: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  screenSub: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  segBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  segLabelActive: { color: '#fff' },
  metricsRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  chart: { borderRadius: radius.md },
  aiCard: {
    backgroundColor: '#f0fdfa',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  aiTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryDark, marginBottom: spacing.sm },
  aiBody: { fontSize: 14, lineHeight: 22, color: colors.text },
});
