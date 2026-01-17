import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { insertMealRecord } from '../database/database';
import { getTodayDuty } from '../utils/getTodayDuty';

type Props = {
  uuid: string;
};

const MEAL_LABELS = [
  { key: 'rice', label: 'ご飯もの' },
  { key: 'noodle', label: '麺類' },
  { key: 'light', label: '軽食・パン' },
  { key: 'healthy', label: '健康・和食' },
  { key: 'supplement', label: '補給のみ' },
  { key: 'skip', label: '抜き' },
];

export default function MealInputButtons({ uuid }: Props) {
  const handlePress = async (mealLabel: string) => {
    try {
      const dutyDate = getTodayDuty(); // 売上と同じ出庫日ロジック
      await insertMealRecord(uuid, dutyDate, mealLabel);
      Alert.alert('保存しました', `食事：${mealLabel}`);
    } catch (e) {
      console.error(e);
      Alert.alert('エラー', '食事の保存に失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>食事タグ</Text>
      <View style={styles.buttonWrap}>
        {MEAL_LABELS.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={styles.button}
            onPress={() => handlePress(m.key)}
          >
            <Text style={styles.buttonText}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 14,
  },
});
