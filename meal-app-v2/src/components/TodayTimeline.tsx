import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { getDailyRecords } from '../database/database';
import { getMealRecordsByDate } from '../database/mealRecords';

type Props = {
  uuid: string;
  dutyDate: string;
};

type TimelineItem =
  | {
      type: 'sales';
      id: number;
      time: string;
      value: number;
    }
  | {
      type: 'meal';
      id: number;
      time: string;
      label: string;
    };

export default function TodayTimeline({ uuid, dutyDate }: Props) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sales = await getDailyRecords(uuid, dutyDate);
        const meals = await getMealRecordsByDate(uuid, dutyDate);

        const saleItems: TimelineItem[] = sales.map(r => ({
          type: 'sales',
          id: r.id,
          time: r.created_at,
          value: r.sales,
        }));

        const mealItems: TimelineItem[] = meals.map(r => ({
          type: 'meal',
          id: r.id,
          time: r.created_at,
          label: r.tag, // ← meal_label ではなく tag
        }));

        const merged = [...saleItems, ...mealItems].sort(
          (a, b) => a.time.localeCompare(b.time)
        );

        setItems(merged);
      } catch (e) {
        console.error('timeline load error', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [uuid, dutyDate]);

  // 🔽 Timeline 自身は「空メッセージ」を出さない
  if (loading) {
    return <Text style={styles.sub}>読み込み中...</Text>;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {items.map(item => {
        if (item.type === 'sales') {
          return (
            <Text key={`s-${item.id}`} style={styles.sales}>
              💴 {item.time.slice(11, 16)}　売上：{item.value.toLocaleString()} 円
            </Text>
          );
        }

        return (
          <Text key={`m-${item.id}`} style={styles.meal}>
            🍽 {item.time.slice(11, 16)}　食事：{item.label}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sub: {
    margin: 16,
    color: '#666',
  },
  sales: {
    fontSize: 16,
    marginVertical: 4,
  },
  meal: {
    fontSize: 16,
    marginVertical: 4,
  },
});
