// src/components/TodaySalesList.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  getTodaySalesRecords,
} from '../database/database';
import { BUSINESS_TYPE_JP } from './salesLabels';

type Props = {
  uuid: string;
  dutyDate: string;
};

type SalesRecord = {
  id: number;
  sales: number;
  business_type: string;
  created_at: string;
};

export default function TodaySalesList({ uuid, dutyDate }: Props) {
  const [records, setRecords] = useState<SalesRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await getTodaySalesRecords(uuid, dutyDate);
      setRecords(res);
    };
    load();
  }, [uuid, dutyDate]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });

  if (records.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>売上履歴</Text>

      {records.map(r => (
        <View key={r.id} style={styles.row}>
          <Text style={styles.left}>
            💴 {formatTime(r.created_at)}　
            {BUSINESS_TYPE_JP[r.business_type] ?? r.business_type}
          </Text>
          <Text style={styles.amount}>
            {r.sales.toLocaleString()} 円
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  left: {
    fontSize: 14,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
