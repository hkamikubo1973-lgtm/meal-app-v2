import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTodayTotal } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey?: number;
};

export default function TodayTotal({
  uuid,
  dutyDate,
  refreshKey = 0,
}: Props) {
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      const t = await getTodayTotal(uuid, dutyDate);
      setTotal(t ?? 0);
    };
    load();
  }, [uuid, dutyDate, refreshKey]);

  return (
    <View style={styles.box}>
      <Text style={styles.title}>本日の売上</Text>
      <Text style={styles.total}>
        {total.toLocaleString()} 円
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    color: '#555',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
