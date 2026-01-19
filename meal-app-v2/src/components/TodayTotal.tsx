// src/components/TodayTotal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTodayTotal } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey: number;
};

export default function TodayTotal({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      const t = await getTodayTotal(uuid, dutyDate);
      setTotal(t);
    };
    load();
  }, [uuid, dutyDate, refreshKey]);

  return (
    <View style={styles.box}>
      <Text style={styles.date}>乗務日：{dutyDate}</Text>
      <Text style={styles.total}>
        本日の売上：{total.toLocaleString()} 円
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 12 },
  date: { fontSize: 14 },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
});
