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
  /* =====================
     state
  ===================== */

  // TextInput 用（文字列）
  const [amountText, setAmountText] = useState('');

  // 保存用（数値）
  const amount = Number(amountText);

  const [businessType, setBusinessType] =
    useState<BusinessType>('normal');

  const [saving, setSaving] = useState(false);

  /* =====================
     判定
  ===================== */

  const canSave = !saving && amount > 0;

  /* =====================
     保存処理
  ===================== */

  const handleSave = async () => {
    if (!canSave) return;

    try {
      setSaving(true);
      console.log('[SAVE] pressed');

      await insertDailyRecord(
        uuid,
        dutyDate,
        amount,
        businessType
      );

      console.log('[SAVE] DB SUCCESS');

      // 入力初期化
      setAmountText('');
      setBusinessType('normal');

      Keyboard.dismiss();

      onSaved();
      console.log('[SAVE] REFRESH DONE');
    } catch (e) {
      console.error('[SAVE] ERROR', e);
    } finally {
      setSaving(false);
    }
  };

  /* =====================
     render
  ===================== */

  return (
    <View style={styles.container}>
      <Text style={styles.label}>売上金額（円）</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amountText}
        onChangeText={(text) =>
          setAmountText(text.replace(/[^0-9]/g, ''))
        }
        placeholder="例：3000"
      />

      <View style={styles.typeRow}>
        {BUSINESS_TYPES.map((t) => (
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

/* =====================
   styles
===================== */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 10,
  },

  typeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  typeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginRight: 8,
  },

  typeActive: {
    backgroundColor: '#e6f0ff',
    borderColor: '#4a90e2',
  },

  typeText: {
    fontSize: 13,
    color: '#333',
  },

  typeTextActive: {
    fontSize: 13,
    color: '#1a5fd0',
    fontWeight: 'bold',
  },

  saveButton: {
    borderRadius: 6,
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
    fontWeight: 'bold',
  },
});
