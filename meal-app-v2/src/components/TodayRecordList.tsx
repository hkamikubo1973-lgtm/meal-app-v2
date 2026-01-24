import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMealCountByDutyDate } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
};

export default function TodayRecordList({ uuid, dutyDate }: Props) {
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCount = async () => {
      try {
        const c = await getMealCountByDutyDate(uuid, dutyDate);
        if (mounted) setCount(c);
      } catch (e) {
        console.error(e);
        if (mounted) setError('食事データ取得エラー');
      }
    };

    loadCount();

    return () => {
      mounted = false;
    };
  }, [uuid, dutyDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>食事</Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.value}>食事：{count}件</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  error: {
    fontSize: 14,
    color: 'red',
  },
});
