import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  getMealRecordsByDutyDate,
  MealRecord,
} from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  mealRefreshKey: number;
};

export default function MealSummary({
  uuid,
  dutyDate,
  mealRefreshKey,
}: Props) {
  const [meals, setMeals] = useState<MealRecord[]>([]);

  const loadMeals = async () => {
    const records = await getMealRecordsByDutyDate(
      uuid,
      dutyDate
    );
    setMeals(records);
  };

  useEffect(() => {
    loadMeals();
  }, [uuid, dutyDate, mealRefreshKey]);

  if (meals.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>食事記録はありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>本日の食事</Text>
      {meals.map(m => (
        <Text key={m.id} style={styles.item}>
          ・{m.meal_label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  item: {
    fontSize: 13,
    marginVertical: 2,
  },
  empty: {
    fontSize: 12,
    color: '#777',
  },
});
