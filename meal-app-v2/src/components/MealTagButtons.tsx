// src/components/MealTagButtons.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { insertMealRecord, MealLabel } from '../database/mealRecords';

type Props = {
  uuid: string;
  dutyDate: string;
  onSaved?: () => void;
};

const MEAL_BUTTONS: { label: string; value: MealLabel }[] = [
  { label: '麺類', value: 'noodle' },
  { label: 'ご飯もの', value: 'rice' },
  { label: '軽食・パン', value: 'light' },
  { label: '健康・和食', value: 'healthy' },
  { label: '補給のみ', value: 'supplement' },
  { label: '抜き', value: 'skip' },
];

export default function MealTagButtons({
  uuid,
  dutyDate,
  onSaved,
}: Props) {
  const handlePress = async (meal: MealLabel) => {
    try {
      console.log('MEAL BUTTON PRESSED:', meal);

      await insertMealRecord(uuid, dutyDate, meal);

      console.log('MEAL SAVED');

      onSaved?.();
    } catch (e) {
      console.error('MEAL SAVE ERROR', e);
      Alert.alert('保存失敗', String(e));
    }
  };

  return (
    <View style={styles.container}>
      {MEAL_BUTTONS.map((item) => (
        <TouchableOpacity
          key={item.value}
          style={styles.button}
          onPress={() => handlePress(item.value)}
        >
          <Text style={styles.text}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    marginVertical: 6,
    borderRadius: 6,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
