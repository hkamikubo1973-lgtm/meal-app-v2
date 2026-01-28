import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { getMealRecordsByDutyDate, MealRecord } from '../database/mealRecords';
import { MEAL_LABEL_JP } from './mealLabels';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey?: number;
};

export default function TodayRecordList({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {
  const [records, setRecords] = useState<MealRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await getMealRecordsByDutyDate(uuid, dutyDate);
        setRecords(rows);
      } catch (e) {
        console.error('MEAL LOAD ERROR', e);
      }
    };
    load();
  }, [uuid, dutyDate, refreshKey]);

  // ===== 種類別集計 =====
  const summary = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach(r => {
      map[r.meal_label] = (map[r.meal_label] || 0) + 1;
    });
    return map;
  }, [records]);

  if (records.length === 0) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.title}>本日の記録</Text>
        <Text style={styles.empty}>記録はまだありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* ヘッダ */}
      <Text style={styles.title}>
        本日の記録（{records.length}件）
      </Text>

      {/* ===== 集計サマリー ===== */}
      <View style={styles.summary}>
        {Object.entries(summary).map(([label, count]) => {
          const name =
            MEAL_LABEL_JP[label as keyof typeof MEAL_LABEL_JP] ?? label;
          return (
            <Text key={label} style={styles.summaryItem}>
              {name} ×{count}
            </Text>
          );
        })}
      </View>

      {/* ===== 明細 ===== */}
      {records.map(r => {
        const label =
          MEAL_LABEL_JP[r.meal_label as keyof typeof MEAL_LABEL_JP]
            ?? r.meal_label;

        const time = new Date(r.created_at).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <View key={r.id} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  empty: {
    fontSize: 13,
    color: '#777',
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 12,
    color: '#555',
    marginRight: 8,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
  },
  time: {
    fontSize: 13,
    color: '#666',
  },
});
