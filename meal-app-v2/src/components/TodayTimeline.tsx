import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getMealRecordsByDutyDate } from '../database/mealRecords';

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
  }, [uuid, dutyDate, refreshKey]);

  const load = async () => {
    const rows = await getMealRecordsByDutyDate(uuid, dutyDate);
    setMeals(rows);
  };

  if (meals.length === 0) {
    return (
      <Text style={styles.empty}>
        食事記録はまだありません
      </Text>
    );
  }

  return (
    <View>
      {meals.map(m => (
        <Text key={m.id} style={styles.item}>
          {m.meal_label}
          {m.memo ? ` ${m.memo}` : ''}
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
  item: {
    paddingVertical: 4,
  },
});
