import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { getMealRecordsByDate } from '../database/mealRecords';

type Props = {
  uuid: string;
  dutyDate: string;
};

type MealRecord = {
  id: number;
  meal_label: string;
  created_at: string;
};

/* =========
   表示用ラベル変換
   （DBは英語キー、UIは日本語）
========= */
const MEAL_LABEL_MAP: Record<string, string> = {
  noodles: '麺類',
  rice: 'ご飯もの',
  light: '軽食・パン',
  healthy: '健康・和食',
  supplement: '補給のみ',
};

export default function TodayRecordList({ uuid, dutyDate }: Props) {
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMealRecordsByDate(uuid, dutyDate);
        setRecords(res);
      } catch (e) {
        console.error('meal load error', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [uuid, dutyDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        食事：{records.length} 件
      </Text>

      {loading && (
        <Text style={styles.subText}>読み込み中…</Text>
      )}

      {!loading && records.length === 0 && (
        <Text style={styles.subText}>記録はまだありません</Text>
      )}

      {!loading && records.length > 0 && (
        <View style={styles.list}>
          {records.map(r => (
            <Text key={r.id} style={styles.item}>
              ・{MEAL_LABEL_MAP[r.meal_label] ?? r.meal_label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

/* =========
   Style
========= */
const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subText: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
  },
  list: {
    marginTop: 6,
  },
  item: {
    fontSize: 15,
    marginVertical: 2,
  },
});
