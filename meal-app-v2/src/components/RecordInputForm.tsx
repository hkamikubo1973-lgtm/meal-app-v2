// src/components/RecordInputForm.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { getDb } from '../database/database';

const TYPES = ['通常', '貸切', 'その他'] as const;

export default function RecordInputForm({ onSaved }: { onSaved?: () => void }) {
  const [sales, setSales] = useState('');
  const [type, setType] = useState<typeof TYPES[number]>('通常');
  const [error, setError] = useState<string | null>(null);

  const saveRecord = async () => {
    setError(null);

    const amount = Number(sales);
    if (!amount || amount <= 0) {
      setError('売上を正しく入力してください');
      return;
    }

    const db = await getDb();
    const today = new Date().toISOString().slice(0, 10);

    // 既存チェック（同日＋同種別）
    const existing = await db.getAllAsync<{
      id: number;
    }>(
      `SELECT id FROM records WHERE date = ? AND type = ? LIMIT 1`,
      [today, type]
    );

    if (existing.length > 0) {
      // UPDATE
      await db.runAsync(
        `UPDATE records SET sales = ? WHERE id = ?`,
        [amount, existing[0].id]
      );
    } else {
      // INSERT
      await db.runAsync(
        `INSERT INTO records (date, sales, type) VALUES (?, ?, ?)`,
        [today, amount, type]
      );
    }

    // 入力リセット
    setSales('');
    setType('通常');

    onSaved?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>売上入力</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="売上金額"
        value={sales}
        onChangeText={setSales}
      />

      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <Button
            key={t}
            title={t}
            onPress={() => setType(t)}
            color={type === t ? '#007AFF' : '#999'}
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="保存" onPress={saveRecord} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
