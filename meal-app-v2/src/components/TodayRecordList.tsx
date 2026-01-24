import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
<<<<<<< HEAD
import { getMealCountByDutyDate } from '../database/database';
=======
import { getMealRecordsByDate } from '../database/mealRecords';
>>>>>>> c510af0692acee9c11d68de8e3d5d1ecdc02a23a

type Props = {
  uuid: string;
  dutyDate: string;
<<<<<<< HEAD
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
=======
  refreshKey: number;
};

export default function TodayRecordList({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const rows = await getMealRecordsByDate(uuid, dutyDate);
      console.log('MEAL RECORDS ROWS', rows);
      setRecords(Array.isArray(rows) ? rows : []);
>>>>>>> c510af0692acee9c11d68de8e3d5d1ecdc02a23a
    };
    load();
  }, [uuid, dutyDate, refreshKey]);

<<<<<<< HEAD
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
=======
  if (records.length === 0) {
    return <Text style={styles.empty}>食事記録はまだありません</Text>;
  }

  return (
    <View>
      {records.map((r, i) => (
        <Text key={i} style={styles.item}>
          ・{r.label}
        </Text>
      ))}
>>>>>>> c510af0692acee9c11d68de8e3d5d1ecdc02a23a
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { margin: 16, color: '#666' },
  item: { margin: 8, fontSize: 16 },
});
