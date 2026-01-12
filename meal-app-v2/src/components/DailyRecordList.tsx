import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  records: any[];
};

export default function DailyRecordList({ records }: Props) {
  if (!records.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>本日の記録はまだありません</Text>
      </View>
    );
  }

  return (
    <View>
      {records.map((r, index) => (
        <View
          key={r.id}
          style={[
            styles.card,
            index === 0 && styles.latest, // ★ 直近ハイライト
          ]}
        >
          <Text style={styles.date}>
            {r.date}（{r.type}）
          </Text>
          <Text style={styles.sales}>
            ¥{r.sales.toLocaleString()}
          </Text>
          <Text style={styles.health}>健康スコア：{r.health_score}</Text>
          {r.memo ? (
            <Text style={styles.memo}>{r.memo}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  latest: {
    backgroundColor: '#f4f8ff', // 淡い青
    borderColor: '#cddcff',
  },
  date: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sales: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  health: {
    fontSize: 12,
    color: '#555',
  },
  memo: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
  },
});
