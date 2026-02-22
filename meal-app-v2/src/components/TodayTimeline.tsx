import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getMealRecordsByDutyDate } from '../database/mealRecords';
import { MEAL_LABEL_JP } from './mealLabels';

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
    <View style={styles.container}>
      {meals.map(m => {
        const label =
          MEAL_LABEL_JP[m.meal_label as keyof typeof MEAL_LABEL_JP] ??
          m.meal_label;

        return (
          <View key={m.id} style={styles.itemRow}>
            <Text style={styles.mealType}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
  },
  empty: {
    paddingVertical: 8,
    color: '#666',
  },
  itemRow: {
    paddingVertical: 4,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '600',
  },
});