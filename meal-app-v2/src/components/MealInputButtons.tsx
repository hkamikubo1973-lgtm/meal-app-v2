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
  MealLabel,
} from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  onMealRefresh: () => void;
};

/**
 * 🔒 食事ラベル正本（ここが唯一の定義）
 */
const MEAL_LABELS: { key: MealLabel; label: string }[] = [
  { key: 'rice', label: 'ごはん・丼' },
  { key: 'noodle', label: '麺類' },
  { key: 'light', label: '軽食・パン' },
  { key: 'healthy', label: '定食' },
  { key: 'supplement', label: '補給のみ' },
  { key: 'skip', label: '抜き' },
];

export default function MealInputButtons({
  uuid,
  dutyDate,
  onMealRefresh,
}: Props) {

  const handleAddMeal = async (mealLabel: MealLabel) => {
    try {
      /** ★★★ 強制ログ（最重要） ★★★ */
      console.log('MEAL INSERT TRY', {
        uuid,
        dutyDate,
        mealLabel,
      });

      if (!mealLabel) {
        throw new Error('mealLabel is undefined');
      }

      await insertMealRecord(
        uuid,
        dutyDate,
        mealLabel,
        null
      );

      console.log('MEAL INSERT OK');

      onMealRefresh();
    } catch (e) {
      console.error('MEAL INSERT ERROR', e);
      Alert.alert('エラー', '食事の記録に失敗しました');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>食事を記録</Text>

      <View style={styles.row}>
        {MEAL_LABELS.map(item => (
          <Pressable
            key={item.key}
            style={styles.button}
            onPress={() => handleAddMeal(item.key)}
          >
            <Text style={styles.buttonText}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
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
