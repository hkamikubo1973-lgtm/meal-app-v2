import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import { getDailyMealMemo } from '../database/mealRecords';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey: number;
};

export default function DailyMealSummary({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {

  const [dailyMemo, setDailyMemo] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    load();
  }, [uuid, dutyDate, refreshKey]);

  const load = async () => {
    const row = await getDailyMealMemo(uuid, dutyDate);
    setDailyMemo(row);
  };

  const memoList = dailyMemo
    ? [
        { label: '朝', value: dailyMemo.breakfast_memo },
        { label: '昼', value: dailyMemo.lunch_memo },
        { label: '夜', value: dailyMemo.dinner_memo },
        { label: '間食', value: dailyMemo.snack_memo },
      ].filter(m => m.value)
    : [];

  if (memoList.length === 0) return null;

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={() => setOpen(v => !v)}
      >
        <Text style={styles.title}>
          📝 今日のまとめ（{memoList.length}件）
        </Text>
        <Text style={styles.toggle}>
          {open ? '▲' : '▼'}
        </Text>
      </Pressable>

      {open && (
        <View style={styles.body}>
          {memoList.map((m, i) => (
            <Text key={i} style={styles.line}>
              {m.label}：{m.value}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggle: {
    fontSize: 14,
    color: '#666',
  },
  body: {
    marginTop: 6,
  },
  line: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  },
});