import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDb } from '../database/database';

export default function TodayTotal({ refreshKey }: { refreshKey: number }) {
  const [total, setTotal] = useState<number>(0);

  const loadTotal = async () => {
    const db = await getDb();
    const today = new Date().toISOString().slice(0, 10);

    const rows = await db.getAllAsync<{ total: number }>(
      `SELECT COALESCE(SUM(sales), 0) AS total FROM records WHERE date = ?`,
      [today]
    );

    setTotal(rows[0]?.total ?? 0);
  };

  useEffect(() => {
    loadTotal();
  }, [refreshKey]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>本日の売上合計</Text>
      <Text style={styles.total}>¥{total.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  total: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
