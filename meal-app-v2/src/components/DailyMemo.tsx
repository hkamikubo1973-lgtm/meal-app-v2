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
import { Picker } from '@react-native-picker/picker';

type Props = {
  uuid: string;
  dutyDate: string;
};

type MemoData = {
  time1: string;
  text1: string;
  time2: string;
  text2: string;
  free: string;
};

export default function DailyMemo({ uuid, dutyDate }: Props) {

  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const [data, setData] = useState<MemoData>({
    time1: '',
    text1: '',
    time2: '',
    text2: '',
    free: '',
  });

  const storageKey = `memo_${uuid}_${dutyDate}`;

  /* ===================== 読み込み ===================== */
  useEffect(() => {
    loadMemo();
    setSaved(false);
  }, [dutyDate]);

  const loadMemo = async () => {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return;

    try {
      setData(JSON.parse(raw));
    } catch {
      setData(prev => ({ ...prev, free: raw }));
    }
  };

  /* ===================== 保存 ===================== */
  const saveMemo = async () => {
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const update = (key: keyof MemoData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  
  /* ===================== 共通Picker ===================== */
  const TimePicker = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => {
    const h = value.split(':')[0] || '';
    const m = value.split(':')[1] || '';

    return (
      <View style={styles.timeRow}>

        <Picker
          selectedValue={h}
          style={styles.picker}
          onValueChange={(val) => onChange(`${val}:${m || '00'}`)}
        >
          <Picker.Item label="時" value="" />
          {Array.from({ length: 24 }).map((_, i) => {
            const v = String(i).padStart(2, '0');
            return <Picker.Item key={v} label={v} value={v} />;
          })}
        </Picker>

        <Picker
          selectedValue={m}
          style={styles.picker}
          onValueChange={(val) => onChange(`${h || '00'}:${val}`)}
        >
          <Picker.Item label="分" value="" />
          {[0,5,10,15,20,25,30,35,40,45,50,55].map(v => {
            const val = String(v).padStart(2, '0');
            return <Picker.Item key={val} label={val} value={val} />;
          })}
        </Picker>

      </View>
    );
  };

  /* ===================== UI ===================== */

  return (
    <View style={styles.wrapper}>

      <Pressable onPress={() => setOpen(v => !v)}>
        <Text style={styles.toggle}>
          {open ? '▲ 今日の予定・メモを閉じる' : '▼ 今日の予定・メモを表示'}
        </Text>
      </Pressable>

      {open && (
        <View style={styles.box}>

          {/* ===== ①予定 ===== */}
          <Text style={styles.label}>①予定</Text>

          <View style={styles.row}>
            <TimePicker
              value={data.time1}
              onChange={(v) => update('time1', v)}
            />

            <TextInput
              style={styles.text}
              placeholder="予定内容"
              multiline
              value={data.text1}
              onChangeText={(v) => update('text1', v)}
            />
          </View>

          {/* ===== ②予定 ===== */}
          <Text style={styles.label}>②予定</Text>

          <View style={styles.row}>
            <TimePicker
              value={data.time2}
              onChange={(v) => update('time2', v)}
            />

            <TextInput
              style={styles.text}
              placeholder="予定内容"
              multiline
              value={data.text2}
              onChangeText={(v) => update('text2', v)}
            />
          </View>

          {/* ===== メモ ===== */}
          <Text style={styles.label}>メモ</Text>

          <TextInput
            style={styles.free}
            placeholder="自由記入"
            multiline
            value={data.free}
            onChangeText={(v) => update('free', v)}
          />

        </View>
      )}

      {/* ===== 固定保存ボタン ===== */}
      {open && (
        <View style={styles.fixedSave}>
          <Pressable style={styles.saveButton} onPress={saveMemo}>
            <Text style={styles.saveText}>保存</Text>
          </Pressable>

          {saved && (
            <Text style={styles.savedMessage}>
              ✓ 保存しました
            </Text>
          )}
        </View>
      )}

    </View>
  );
}

/* ===================== style ===================== */

const styles = StyleSheet.create({

  wrapper: {
    marginHorizontal: 12,
  },

  toggle: {
  fontSize: 13,
  color: '#1976D2',
  paddingHorizontal: 4,
  paddingVertical: 4,
},

  box: {
    marginTop: 6,
    backgroundColor: '#F9FAFB',
    padding: 10,
    paddingBottom: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#555',
  },

  row: {
    marginBottom: 10,
  },

  timeRow: {
    flexDirection: 'row',
  },

  picker: {
  flex: 1,
  height: 60,
},

timeRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ddd',
  paddingHorizontal: 4,
},

  text: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 6,
    minHeight: 40,
    textAlignVertical: 'top',
  },

  free: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 6,
    minHeight: 70,
    textAlignVertical: 'top',
  },

  fixedSave: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 12,
  },

  saveButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  savedMessage: {
    marginTop: 4,
    color: '#2E7D32',
    fontSize: 12,
    textAlign: 'center',
  },

});