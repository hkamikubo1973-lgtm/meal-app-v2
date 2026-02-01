import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getMealRecordsByDutyDate } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey: number;
};

export default function TodayTimeline({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {
  const [meals, setMeals] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, [uuid, dutyDate, refreshKey]); // ★ここが①の核心

  const load = async () => {
    const rows = await getMealRecordsByDutyDate(uuid, dutyDate);
    setMeals(rows);
  };

  if (meals.length === 0) {
    return <Text style={styles.empty}>食事記録はまだありません</Text>;
  }

  return (
    <View>
      {meals.map(m => (
        <Text key={m.id}>
          {m.meal_label} {m.memo ?? ''}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 8,
    color: '#666',
  },
});
