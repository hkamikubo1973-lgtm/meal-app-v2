// src/components/RecordInputForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  insertDailyRecord,
  BusinessType,
} from '../database/database';

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
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<BusinessType>('normal');

  const save = async () => {
    const value = Number(amount);
    if (!value || value <= 0) return;

    await insertDailyRecord(uuid, dutyDate, value, type);
    setAmount('');
    onSaved();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>売上種別</Text>

      {/* 種別 */}
      <View style={styles.types}>
        {[
          { key: 'normal', label: '通常' },
          { key: 'charter', label: '貸切' },
          { key: 'other', label: 'その他' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.typeBtn,
              type === t.key && styles.typeSelected,
            ]}
            onPress={() => setType(t.key as BusinessType)}
          >
            <Text>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 金額 */}
      <TextInput
        style={styles.input}
        placeholder="売上金額（円）"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* 保存 */}
      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>保存</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  types: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginRight: 6,
  },
  typeSelected: {
    backgroundColor: '#def',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#333',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
