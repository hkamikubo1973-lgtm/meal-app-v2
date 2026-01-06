import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { DailyRecord } from '../database/database';

type Props = {
  records: DailyRecord[];
};

export const DailyRecordList: React.FC<Props> = ({ records }) => {
  return (
    <FlatList
      data={records}
      keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.sales}>¥{item.sales}</Text>
          <Text style={styles.score}>★{item.health_score}</Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>データがありません</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  date: {
    flex: 2,
    fontSize: 14,
  },
  sales: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  score: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  empty: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
  },
});
