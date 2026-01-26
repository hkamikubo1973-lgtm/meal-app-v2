import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  MealRecord,
  getMealRecordsByDutyDate,
} from '../database/database';
import { MEAL_LABEL_JP } from './mealLabels';

type Props = {
  uuid: string;
  dutyDate: string;
};

export default function TodayRecordList({ uuid, dutyDate }: Props) {
  const [records, setRecords] = useState<MealRecord[]>([]);

  useEffect(() => {
    getMealRecordsByDutyDate(uuid, dutyDate).then(setRecords);
  }, [uuid, dutyDate]);

  /* =========
     時刻表示
  ========= */
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });

  /* =========
     食事集計
  ========= */
  const summary = useMemo(() => {
    const base: Record<string, number> = {
      rice: 0,
      noodle: 0,
      light: 0,
      healthy: 0,
      supplement: 0,
      skip: 0,
    };

    records.forEach(r => {
      if (base[r.meal_label] !== undefined) {
        base[r.meal_label]++;
      }
    });

    return base;
  }, [records]);

  return (
    <View style={styles.wrapper}>
      {/* 件数 */}
      <Text style={styles.title}>食事（{records.length}回）</Text>

      {/* 集計表示 */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>食事内訳</Text>
        {Object.entries(summary).map(([key, count]) => (
          <Text key={key} style={styles.summaryItem}>
            ・{MEAL_LABEL_JP[key] ?? key}：{count}回
          </Text>
        ))}
      </View>

      {/* 履歴 */}
      {records.map(r => (
        <View key={r.id} style={styles.row}>
          <Text style={styles.label}>
            {MEAL_LABEL_JP[r.meal_label] ?? r.meal_label}
          </Text>
          <Text style={styles.time}>{formatTime(r.created_at)}</Text>
        </View>
      ))}
    </View>
  );
}

/* =========
   styles
========= */
const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryBox: {
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryItem: {
    fontSize: 14,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 16,
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
});
