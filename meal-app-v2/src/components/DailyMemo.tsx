// src/components/DailyMemo.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  displayDate: string; // UI表示日付
};

export default function DailyMemo({ displayDate }: Props) {
  const [open, setOpen] = useState(false);
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState(false); // ★ 追加

  const storageKey = `memo_${displayDate}`;

  /* =====================
     読み込み
  ===================== */
  useEffect(() => {
    loadMemo();
    setSaved(false); // 日付変更時は保存表示リセット
  }, [displayDate]);

  const loadMemo = async () => {
    const savedMemo = await AsyncStorage.getItem(storageKey);
    if (savedMemo) {
      setMemo(savedMemo);
    } else {
      setMemo('');
    }
  };

  /* =====================
     保存
  ===================== */
  const saveMemo = async () => {
    await AsyncStorage.setItem(storageKey, memo);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 800);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={() => setOpen(v => !v)}>
        <Text style={styles.toggle}>
          {open ? '▲ 今日の予定・メモを閉じる' : '▼ 今日の予定・メモを表示'}
        </Text>
      </Pressable>

      {open && (
        <View style={styles.box}>
          <TextInput
            style={styles.input}
            placeholder="今日の予定やメモを入力..."
            multiline
            value={memo}
            onChangeText={setMemo}
          />

          <Pressable style={styles.saveButton} onPress={saveMemo}>
            <Text style={styles.saveText}>保存</Text>
          </Pressable>

          {/* ★ 保存完了メッセージ */}
          {saved && (
            <Text style={styles.savedText}>
              保存しました
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
  toggle: {
    fontSize: 13,
    color: '#1976D2',
  },
  box: {
    marginTop: 6,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
  savedText: {
    marginTop: 6,
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
  },
});