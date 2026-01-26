// src/components/TodaySalesList.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTodaySalesRecords } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
};

type SalesRow = {
  id: number;
  sales: number;
  created_at: string;
};

export default function TodaySalesList({ uuid, dutyDate }: Props) {
  const [rows, setRows] = useState<SalesRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const result = await getTodaySalesRecords(uuid, dutyDate);
      setRows(Array.isArray(result) ? result : []);
    };
    load();
  }, [uuid, dutyDate]);

  if (rows.length === 0) {
    return <Text style={styles.empty}>売上：未入力</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>今日の売上</Text>

      {rows.map(r => {
        const time = new Date(r.created_at).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <Text key={r.id} style={styles.item}>
            ・{time}　{r.sales.toLocaleString()}円
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  item: {
    fontSize: 14,
    marginVertical: 2,
  },
  empty: {
    margin: 16,
    color: '#666',
  },
});
