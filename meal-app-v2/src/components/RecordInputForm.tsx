// src/components/RecordInputForm.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { insertDailyRecord } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  onSaved: () => void;
};

export default function RecordInputForm({
  uuid,
  dutyDate,
  onSaved,
}: Props) {
  const [value, setValue] = useState('');

  const save = async () => {
    const num = Number(value);
    if (!num) return;
    await insertDailyRecord(uuid, dutyDate, num);
    setValue('');
    onSaved();
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>売上金額</Text>

      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType="number-pad"
        placeholder="例：50000"
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>保存</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
