import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDb } from '../database/database';

type Record = {
  id: number;
  date: string;
  sales: number;
  type: string;
};

export default function TodayRecordList({ refreshKey }: { refreshKey: number }) {
  const [records, setRecords] = useState<Record[]>([]);

  const loadRecords = async () => {
    const db = await getDb();
    const today = new Date().toISOString().slice(0, 10);

    const rows = await db.getAllAsync<Record>(
      `SELECT * FROM records WHERE date = ? ORDER BY id DESC`,
      [today]
    );

    setRecords(rows);
  };

  useEffect(() => {
    loadRecords();
  }, [refreshKey]);

  if (records.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>今日の入力はまだありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>本日の入力一覧</Text>

      {records.map((r) => (
        <View key={r.id} style={styles.row}>
          <Text style={styles.type}>{r.type}</Text>
          <Text style={styles.sales}>¥{r.sales.toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  type: {
    fontSize: 15,
  },
  sales: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  empty: {
    color: '#666',
  },
});
