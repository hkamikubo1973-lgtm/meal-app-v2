// src/components/RecordInputForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';

import { insertDailyRecord } from '../database/database';
import { BusinessType } from '../types/actionCard';

type Props = {
  uuid: string;
  dutyDate: string;
  onSaved: () => void;
};

const BUSINESS_TYPES: {
  key: BusinessType;
  label: string;
}[] = [
  { key: 'normal', label: '通常' },
  { key: 'charter', label: '貸切' },
  { key: 'other', label: 'その他' },
];

export default function RecordInputForm({
  uuid,
  dutyDate,
  onSaved,
}: Props) {
  const [amountText, setAmountText] = useState('');
  const amount = Number(amountText);
  const [businessType, setBusinessType] =
    useState<BusinessType>('normal');
  const [saving, setSaving] = useState(false);

  const canSave = !saving && amount > 0;

  const handleSave = async () => {
    if (!canSave) return;

    try {
      setSaving(true);
      await insertDailyRecord(uuid, dutyDate, amount, businessType);
      setAmountText('');
      setBusinessType('normal');
      Keyboard.dismiss();
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* 見出し強化 */}
      <Text style={styles.label}>売上金額（円）</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amountText}
        onChangeText={(text) =>
          setAmountText(text.replace(/[^0-9]/g, ''))
        }
        placeholder="例：30000"
      />

      {/* 種別ボタン均等化 */}
      <View style={styles.typeRow}>
        {BUSINESS_TYPES.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.typeButton,
              businessType === t.key && styles.typeActive,
            ]}
            onPress={() => setBusinessType(t.key)}
          >
            <Text
              style={
                businessType === t.key
                  ? styles.typeTextActive
                  : styles.typeText
              }
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          canSave ? styles.saveActive : styles.saveDisabled,
        ]}
        disabled={!canSave}
        onPress={handleSave}
      >
        <Text style={styles.saveText}>
          {saving ? '保存中…' : '保存'}
        </Text>
      </TouchableOpacity>
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

  /* ===== 見出し統一 ===== */
  label: {
    fontSize: 16,       // ← 大きく
    fontWeight: '600',  // ← 濃く
    color: '#000',      // ← 黒
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
  },

  /* ===== 種別均等配置 ===== */
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  typeButton: {
    flex: 1,               // ← 均等3分割
    marginHorizontal: 4,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  typeActive: {
    backgroundColor: '#e6f0ff',
    borderColor: '#4a90e2',
  },

  typeText: {
    fontSize: 14,
    color: '#333',
  },

  typeTextActive: {
    fontSize: 14,
    color: '#1a5fd0',
    fontWeight: '600',
  },

  saveButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  saveActive: {
    backgroundColor: '#4a90e2',
  },

  saveDisabled: {
    backgroundColor: '#ccc',
  },

  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
