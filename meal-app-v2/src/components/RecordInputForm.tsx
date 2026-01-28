import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';

import WeatherPicker from './WeatherPicker';
import { insertDailyRecord, BusinessType } from '../database/database';

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
  const [sales, setSales] = useState('');
  const [businessType, setBusinessType] =
    useState<BusinessType>('normal');
  const [showWeather, setShowWeather] = useState(false);

  const salesInputRef = useRef<TextInput>(null);

  const salesNumber = Number(sales);
  const canSave = sales !== '' && salesNumber > 0;

  const handleSave = async () => {
    if (!canSave) return;

    await insertDailyRecord(
      uuid,
      dutyDate,
      salesNumber,
      businessType
    );

    setSales('');
    setBusinessType('normal');
    setShowWeather(true);
  };

  return (
    <View style={styles.container}>

      {/* ▼ 売上種別ラベル（★追加） */}
      <Text style={styles.sectionLabel}>売上種別</Text>

      {/* 売上種別 */}
      <View style={styles.typeRow}>
        {[
          { key: 'normal', label: '通常' },
          { key: 'charter', label: '貸切' },
          { key: 'other', label: 'その他' },
        ].map(t => (
          <Pressable
            key={t.key}
            style={[
              styles.typeButton,
              businessType === t.key && styles.typeActive,
            ]}
            onPress={() =>
              setBusinessType(t.key as BusinessType)
            }
          >
            <Text
              style={[
                styles.typeText,
                businessType === t.key && styles.typeTextActive,
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 売上入力 */}
      <TextInput
        ref={salesInputRef}
        value={sales}
        onChangeText={setSales}
        keyboardType="number-pad"
        placeholder="売上金額"
        style={styles.input}
      />

      {/* 保存 */}
      <Pressable
        style={[
          styles.saveButton,
          !canSave && styles.saveDisabled,
        ]}
        onPress={handleSave}
        disabled={!canSave}
      >
        <Text
          style={[
            styles.saveText,
            !canSave && styles.saveTextDisabled,
          ]}
        >
          保存
        </Text>
      </Pressable>

      {/* 天気 */}
      <WeatherPicker
        visible={showWeather}
        uuid={uuid}
        dutyDate={dutyDate}
        onSaved={() => {
          setShowWeather(false);
          onSaved();

          setTimeout(() => {
            salesInputRef.current?.focus();
          }, 100);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },

  /* ★ セクションラベル */
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },

  typeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  typeActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  typeText: {
    color: '#333',
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveDisabled: {
    backgroundColor: '#B0BEC5',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveTextDisabled: {
    color: '#ECEFF1',
  },
});
