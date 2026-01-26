import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTodayTotal } from '../utils/getTodayTotal';

type Props = {
  uuid: string;
  dutyDate: string;
};

export default function TodayTotal({ uuid, dutyDate }: Props) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      const t = await getTodayTotal(uuid, dutyDate);
      setTotal(t ?? 0);
    };
    load();
  }, [uuid, dutyDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>本日の売上</Text>
      <Text style={styles.total}>{total.toLocaleString()} 円</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 16 },
  title: { fontSize: 16, color: '#666' },
  total: { fontSize: 28, fontWeight: 'bold' },
});
