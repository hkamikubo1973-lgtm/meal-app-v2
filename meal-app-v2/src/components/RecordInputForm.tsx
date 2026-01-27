// src/components/RecordInputForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  insertDailyRecord,
  updateWeatherByDutyDate,
  BusinessType,
  WeatherType,
} from '../database/database';

import WeatherPicker from './WeatherPicker';

type Props = {
  uuid: string;
  dutyDate: string;
  onSaved: () => void;
};

const BUSINESS_TYPES: {
  label: string;
  value: BusinessType;
}[] = [
  { label: '通常', value: 'normal' },
  { label: '貸切', value: 'charter' },
  { label: 'その他', value: 'other' },
];

export default function RecordInputForm({
  uuid,
  dutyDate,
  onSaved,
}: Props) {
  const [sales, setSales] = useState('');
  const [type, setType] = useState<BusinessType>('normal');

  // 🔽 天気UI制御
  const [showWeather, setShowWeather] = useState(false);

  const save = async () => {
    const value = Number(sales);
    if (!value || value <= 0) {
      Alert.alert('金額を入力してください');
      return;
    }

    // 売上保存
    await insertDailyRecord(uuid, dutyDate, value, type);

    // 入力リセット
    setSales('');
    setType('normal');

    // 🔽 売上保存後に天気選択を表示
    setShowWeather(true);

    // 上位に通知（集計更新用）
    onSaved();
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>売上入力</Text>

      {/* 種別選択 */}
      <View style={styles.typeRow}>
        {BUSINESS_TYPES.map(t => (
          <Pressable
            key={t.value}
            style={[
              styles.typeButton,
              type === t.value && styles.typeSelected,
            ]}
            onPress={() => setType(t.value)}
          >
            <Text
              style={[
                styles.typeText,
                type === t.value && styles.typeTextSelected,
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 金額入力 */}
      <TextInput
        value={sales}
        onChangeText={setSales}
        keyboardType="number-pad"
        placeholder="売上金額"
        style={styles.input}
      />

      {/* 保存 */}
      <Pressable style={styles.saveButton} onPress={save}>
        <Text style={styles.saveText}>保存</Text>
      </Pressable>

      {/* 🔽 天気選択（DB保存まで実行） */}
      <WeatherPicker
        visible={showWeather}
        onSelect={async (weather) => {
          if (weather) {
            await updateWeatherByDutyDate(
              uuid,
              dutyDate,
              weather as WeatherType
            );
          }
          setShowWeather(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  typeSelected: {
    backgroundColor: '#d0e8ff',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeTextSelected: {
    color: '#005bbb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
