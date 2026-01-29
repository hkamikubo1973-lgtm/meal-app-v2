// src/components/MealInputButtons.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';

import {
  insertMealRecord,
} from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  onMealRefresh: () => void;
};

/**
 * 🔒 食事ラベル正本
 * 不規則勤務前提・内容ベース
 */
const MEAL_LABELS = {
  rice: 'ごはん・丼',
  noodle: '麺類',
  light: '軽食・パン',
  healthy: '定食',
  supplement: '補給のみ',
  skip: '抜き',
} as const;

type MealKey = keyof typeof MEAL_LABELS;

export default function MealInputButtons({
  uuid,
  dutyDate,
  onMealRefresh,
}: Props) {
  const handleAddMeal = async (mealKey: MealKey) => {
    try {
      await insertMealRecord(
        uuid,
        dutyDate,
        mealKey, // ← DBにはキーを保存
        null
      );
      onMealRefresh();
    } catch (e) {
      Alert.alert(
        'エラー',
        '食事の記録に失敗しました'
      );
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>食事を記録</Text>

      <View style={styles.row}>
        {(Object.keys(MEAL_LABELS) as MealKey[]).map(key => (
          <Pressable
            key={key}
            style={styles.button}
            onPress={() => handleAddMeal(key)}
          >
            <Text style={styles.buttonText}>
              {MEAL_LABELS[key]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* =====================
   styles
===================== */
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
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
