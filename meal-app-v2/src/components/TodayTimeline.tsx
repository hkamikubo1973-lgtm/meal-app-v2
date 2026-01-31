import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { getMealRecordsByDutyDate } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey: number; // ★ 追加
};

type MealItem = {
  id: number;
  created_at: string;
  meal_label: string;
};

/* =====================
   食事ラベル日本語変換
   （表示専用・DB非依存）
===================== */
const MEAL_LABEL_MAP: Record<string, string> = {
  rice: 'ごはん・丼',
  noodle: '麺類',
  light: '軽食・パン',
  healthy: '定食',
  supplement: '補給のみ',
  skip: '抜き',
};

export default function TodayTimeline({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {
  const [items, setItems] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const meals = await getMealRecordsByDutyDate(uuid, dutyDate);

        // 時刻順（昇順）
        const sorted = meals
          .slice()
          .sort((a, b) =>
            a.created_at.localeCompare(b.created_at)
          );

        if (mounted) {
          setItems(sorted);
        }
      } catch (e) {
        console.error('MEAL TIMELINE LOAD ERROR', e);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [uuid, dutyDate, refreshKey]); // ★ refreshKey 監視

  /* ===== 読み込み中 ===== */
  if (loading) {
    return (
      <Text style={styles.sub}>
        食事履歴を読み込み中...
      </Text>
    );
  }

  /* ===== 食事なし日は非表示 ===== */
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>タイムライン（食事）</Text>

      {items.map(item => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.time}>
            {item.created_at.slice(11, 16)}
          </Text>
          <Text style={styles.label}>
            🍽 {MEAL_LABEL_MAP[item.meal_label] ?? item.meal_label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* =====================
   styles
===================== */
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  sub: {
    marginHorizontal: 12,
    marginVertical: 6,
    fontSize: 12,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  time: {
    width: 52,
    fontSize: 12,
    color: '#555',
  },
  label: {
    fontSize: 14,
  },
});
