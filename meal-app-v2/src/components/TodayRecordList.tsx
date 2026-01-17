import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTodayMealLabel } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string; // ← 売上と同じ出庫日を必ず受け取る
};

export default function TodayRecordList({ uuid, dutyDate }: Props) {
  const [mealLabel, setMealLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadMeal = async () => {
      try {
        const label = await getTodayMealLabel(uuid, dutyDate);
        if (mounted) {
          setMealLabel(label);
        }
      } catch (e) {
        console.error('meal load error', e);
        if (mounted) {
          setError('食事データ取得エラー');
        }
      }
    };

    loadMeal();

    return () => {
      mounted = false;
    };
  }, [uuid, dutyDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>食事</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {!error && (
        <Text style={styles.value}>
          {mealLabel ? `食事：${mealLabel}` : '食事：未記録'}
        </Text>
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
