// src/components/TodayTimeline.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  getTodaySalesRecords,
  getMealRecordsByDutyDate,
} from '../database/database';

type TimelineItem =
  | {
      type: 'sales';
      id: number;
      amount: number;
      category: string;
      created_at: string;
    }
  | {
      type: 'meal';
      id: number;
      meal_type: string;
      created_at: string;
    };

type Props = {
  uuid: string;
  dutyDate: string;
  salesRefreshKey: number;
  mealRefreshKey: number;
};

export default function TodayTimeline({
  uuid,
  dutyDate,
  salesRefreshKey,
  mealRefreshKey,
}: Props) {
  const [items, setItems] = useState<TimelineItem[]>([]);

  const loadTimeline = async () => {
    const sales = await getTodaySalesRecords(uuid, dutyDate);
    const meals = await getMealRecordsByDutyDate(uuid, dutyDate);

    const salesItems: TimelineItem[] = sales.map((s: any) => ({
      type: 'sales',
      id: s.id,
      amount: s.sales,
      category: s.category,
      created_at: s.created_at,
    }));

    const mealItems: TimelineItem[] = meals.map((m: any) => ({
      type: 'meal',
      id: m.id,
      meal_type: m.meal_type,
      created_at: m.created_at,
    }));

    const merged = [...salesItems, ...mealItems].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    );

    setItems(merged);
  };

  useEffect(() => {
    loadTimeline();
  }, [uuid, dutyDate, salesRefreshKey, mealRefreshKey]);

  if (items.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>
          本日の記録はまだありません
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>本日のタイムライン</Text>

      {items.map(item => (
        <View key={`${item.type}-${item.id}`} style={styles.item}>
          {item.type === 'sales' ? (
            <Text style={styles.sales}>
              💰 {item.amount.toLocaleString()} 円（{item.category}）
            </Text>
          ) : (
            <Text style={styles.meal}>
              🍴 {item.meal_type}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

/* =====================
   styles
===================== */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  empty: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  item: {
    marginBottom: 4,
  },
  sales: {
    fontSize: 13,
    fontWeight: '500',
  },
  meal: {
    fontSize: 13,
  },
});
