// src/components/MealSection.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

type Props = {
  uuid: string;
  dutyDate: string;
};

const MEAL_LABELS = [
  { key: 'breakfast', label: '朝食' },
  { key: 'lunch', label: '昼食' },
  { key: 'dinner', label: '夕食' },
  { key: 'snack', label: '補給' },
  { key: 'night', label: '夜食' },
  { key: 'healthy', label: '健康' },
];

export default function MealSection({ uuid, dutyDate }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [memo, setMemo] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>食事記録</Text>

      <View style={styles.buttons}>
        {MEAL_LABELS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.button,
              selected === m.key && styles.buttonSelected,
            ]}
            onPress={() => setSelected(m.key)}
          >
            <Text>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.memo}
        placeholder="メモ（任意）"
        value={memo}
        onChangeText={setMemo}
      />

      <TouchableOpacity
        style={styles.save}
        onPress={() => {
          // TODO: SQLite保存（次ステップ）
          console.log('save meal', { uuid, dutyDate, selected, memo });
        }}
      >
        <Text style={{ color: '#fff' }}>食事を記録</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, padding: 12, borderTopWidth: 1, borderColor: '#ddd' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap' },
  button: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  buttonSelected: {
    backgroundColor: '#def',
  },
  memo: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  save: {
    marginTop: 12,
    backgroundColor: '#333',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
});
