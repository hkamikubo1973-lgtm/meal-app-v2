// src/components/MealSummary.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  getMealRecordsByDutyDate,
} from '../database/database';

type MealRecord = {
  id: number;
  meal_type: string; // ← DBにはキーが入る
  memo: string | null;
  created_at: string;
};

type Props = {
  uuid: string;
  dutyDate: string;
  mealRefreshKey: number;
};

/**
 * 🔒 食事ラベル正本
 * 不規則勤務前提・内容ベース
 */
const MEAL_LABELS: Record<string, string> = {
  rice: 'ごはん・丼',
  noodle: '麺類',
  light: '軽食・パン',
  healthy: '定食',
  supplement: '補給のみ',
  skip: '抜き',
};

export default function MealSummary({
  uuid,
  dutyDate,
  mealRefreshKey,
}: Props) {
  const [meals, setMeals] = useState<MealRecord[]>([]);

  const loadMeals = async () => {
    const records = await getMealRecordsByDutyDate(uuid, dutyDate);
    setMeals(records);
  };

  useEffect(() => {
    loadMeals();
  }, [uuid, dutyDate, mealRefreshKey]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>本日の食事</Text>
      <Text style={styles.sub}>出庫日：{dutyDate}</Text>

      {meals.length === 0 ? (
        <Text style={styles.empty}>記録はまだありません</Text>
      ) : (
        meals.map(m => (
          <View key={m.id} style={styles.item}>
            <Text style={styles.mealType}>
              ・{MEAL_LABELS[m.meal_type] ?? m.meal_type}
            </Text>
            {m.memo ? (
              <Text style={styles.memo}>{m.memo}</Text>
            ) : null}
          </View>
        ))
      )}
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
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sub: {
    fontSize: 12,
    color: '#666',
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
  mealType: {
    fontSize: 13,
    fontWeight: '500',
  },
  memo: {
    fontSize: 12,
    color: '#555',
    marginLeft: 8,
  },
});
