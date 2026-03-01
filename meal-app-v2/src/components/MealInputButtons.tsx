import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';

import {
  insertMealRecord,
  getDailyMealMemo,
  upsertDailyMealMemo,
} from '../database/mealRecords';

import { MealLabel } from '../types/MealLabel';

type Props = {
  uuid: string;
  dutyDate: string;
  onMealRefresh: () => void;
};

type TimingType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const TIMING_OPTIONS: { key: TimingType; label: string }[] = [
  { key: 'breakfast', label: '朝' },
  { key: 'lunch', label: '昼' },
  { key: 'dinner', label: '夜' },
  { key: 'snack', label: '間食' },
];

const MEAL_LABELS: { key: MealLabel; label: string }[] = [
  { key: 'rice', label: 'ごはん・丼' },
  { key: 'noodle', label: '麺類' },
  { key: 'light', label: '軽食・パン' },
  { key: 'healthy', label: '定食' },
  { key: 'supplement', label: '補給のみ' },
  { key: 'skip', label: '抜き' },
];

const MEMO_ROWS = [
  { key: 'breakfast', label: '朝食' },
  { key: 'lunch', label: '昼食' },
  { key: 'dinner', label: '夕食' },
  { key: 'snack', label: '間食' },
];

export default function MealInputButtons({
  uuid,
  dutyDate,
  onMealRefresh,
}: Props) {

  const [selectedTiming, setSelectedTiming] =
    useState<TimingType>('breakfast');

  const [openMemo, setOpenMemo] = useState(false);
  const [memoMap, setMemoMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ============================
     メモロード
  ============================ */
  useEffect(() => {
    const loadMemo = async () => {
      const row = await getDailyMealMemo(uuid, dutyDate);

      if (row) {
        setMemoMap({
          breakfast: row.breakfast_memo || '',
          lunch: row.lunch_memo || '',
          dinner: row.dinner_memo || '',
          snack: row.snack_memo || '',
        });
      } else {
        setMemoMap({});
      }

      setSaved(false);
    };

    loadMemo();
  }, [uuid, dutyDate]);

  /* ============================
     食事追加（UI timingのみ保持）
  ============================ */
  const handleAddMeal = async (mealLabel: MealLabel) => {
    try {
      await insertMealRecord(uuid, dutyDate, mealLabel);

      console.log('UI_TIMING_SELECTED:', selectedTiming);

      onMealRefresh();
    } catch (e) {
      Alert.alert('エラー', '食事の記録に失敗しました');
    }
  };

  /* ============================
     メモ保存
  ============================ */
  const handleSaveMemo = async () => {
    try {
      setSaving(true);
      await upsertDailyMealMemo(uuid, dutyDate, memoMap);
      setSaved(true);
    } catch (e) {
      Alert.alert('エラー', 'メモの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>食事を記録</Text>

      {/* ===== 時間帯選択 ===== */}
      <View style={styles.timingRow}>
        {TIMING_OPTIONS.map(item => (
          <Pressable
            key={item.key}
            style={[
              styles.timingButton,
              selectedTiming === item.key && styles.timingActive,
            ]}
            onPress={() => setSelectedTiming(item.key)}
          >
            <Text
              style={
                selectedTiming === item.key
                  ? styles.timingTextActive
                  : styles.timingText
              }
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ===== 食事ボタン ===== */}
      <View style={styles.grid}>
        {MEAL_LABELS.map(item => (
          <Pressable
            key={item.key}
            style={styles.button}
            onPress={() => handleAddMeal(item.key)}
          >
            <Text style={styles.text}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ===== メモ ===== */}
      <Pressable
        style={styles.memoToggle}
        onPress={() => setOpenMemo(v => !v)}
      >
        <Text style={styles.memoToggleText}>
          {openMemo ? '▲ 補足メモを閉じる' : '▼ 補足メモを追加'}
        </Text>
      </Pressable>

      {openMemo && (
        <View style={styles.memoBox}>
          {MEMO_ROWS.map(row => (
            <View key={row.key} style={styles.memoRow}>
              <Text style={styles.memoLabel}>{row.label}</Text>
              <TextInput
                style={styles.memoInput}
                value={memoMap[row.key] || ''}
                onChangeText={text =>
                  setMemoMap({
                    ...memoMap,
                    [row.key]: text,
                  })
                }
                placeholder="補足メモ（任意）"
                multiline
                textAlignVertical="top"
                maxLength={120}
              />
            </View>
          ))}

          <Pressable
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleSaveMemo}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? '保存中...' : 'メモを保存'}
            </Text>
          </Pressable>

          {saved && (
            <Text style={styles.savedText}>✔ 保存済み</Text>
          )}
        </View>
      )}
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
    marginBottom: 8,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timingButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timingActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  timingText: {
    fontSize: 13,
    color: '#444',
  },
  timingTextActive: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    flexBasis: '48%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
  memoToggle: {
    marginTop: 6,
  },
  memoToggleText: {
    fontSize: 13,
    color: '#1976D2',
  },
  memoBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#EEE',
  },
  memoRow: {
    marginBottom: 10,
  },
  memoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  memoInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    minHeight: 60,
  },
  saveButton: {
    marginTop: 6,
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  savedText: {
    marginTop: 6,
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
  },
});