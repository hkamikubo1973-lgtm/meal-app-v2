import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMealRecordsByDate } from '../database/mealRecords';

type Props = {
  uuid: string;
  dutyDate: string;
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
    };
    load();
  }, [uuid, dutyDate, refreshKey]);

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
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { margin: 16, color: '#666' },
  item: { margin: 8, fontSize: 16 },
});
