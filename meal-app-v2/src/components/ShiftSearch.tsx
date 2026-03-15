import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';

import { getDutyType } from '../utils/getDutyType';
import { setManualDuty, deleteManualDuty } from '../database/manualDuty';
import { DUTY_LABEL } from '../constants/dutyLabel';

import { DutyType } from '../types/DutyType';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const formatDate = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const overrideList: DutyType[] = [
  'paid',
  'absence',
  'late',
  'leaveEarly'
];

export default function ShiftSearch() {

  const uuid = 'user'; // 後でユーザーIDに変更

  const [date, setDate] = useState<Date>(new Date());
  const [duty, setDuty] = useState<DutyType | null>(null);

  const weekday = WEEKDAYS[date.getDay()];
  const isSunday = date.getDay() === 0;
  const isSaturday = date.getDay() === 6;

  const dutyDate = formatDate(date);

  const loadDuty = async () => {
    const result = await getDutyType(uuid, dutyDate);
    setDuty(result);
  };

  useEffect(() => {
    loadDuty();
  }, [date]);

  const moveDate = (diff: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + diff);
    setDate(d);
  };

  const setOverride = async (type: DutyType) => {

    await setManualDuty(uuid, dutyDate, type);

    Alert.alert('保存しました');

    loadDuty();
  };

  const clearOverride = async () => {

    await deleteManualDuty(uuid, dutyDate);

    Alert.alert('解除しました');

    loadDuty();
  };

  return (
  <View style={styles.wrapper}>

    <Text style={styles.title}>出番検索</Text>

    {/* 日付操作 */}
    <View style={styles.row}>
      <Pressable style={styles.button} onPress={() => moveDate(-1)}>
        <Text style={styles.buttonText}>◀ 前日</Text>
      </Pressable>

      <Text style={styles.dateText}>
        {dutyDate}
      </Text>

      <Pressable style={styles.button} onPress={() => moveDate(1)}>
        <Text style={styles.buttonText}>翌日 ▶</Text>
      </Pressable>
    </View>

    {/* 曜日 */}
    <Text
      style={[
        styles.weekday,
        isSunday && styles.sunday,
        isSaturday && styles.saturday,
      ]}
    >
      （{weekday}）
    </Text>

    {/* 勤務表示 */}
    <View style={styles.dutyBox}>
      <Text style={styles.dutyText}>
        {duty ? DUTY_LABEL[duty] : '未設定'}
      </Text>
    </View>

    {/* ===== 勤務修正 ===== */}
    <Text style={styles.overrideTitle}>
      勤務修正
    </Text>

    {/* 例外入力 */}
    <View style={styles.overrideRow}>
      {overrideList.map(type => (

        <Pressable
          key={type}
          style={styles.overrideButton}
          onPress={() => setOverride(type)}
        >
          <Text style={styles.overrideText}>
            {DUTY_LABEL[type]}
          </Text>
        </Pressable>

      ))}
    </View>

    {/* 修正解除 */}
    <Pressable
      style={styles.clearButton}
      onPress={clearOverride}
    >
      <Text style={styles.clearText}>
        修正解除
      </Text>
    </Pressable>

    <Text style={styles.sub}>
      ※ 未来の日付も確認できます
    </Text>

  </View>
 );
}

const styles = StyleSheet.create({

  wrapper: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },

  buttonText: {
    fontSize: 13,
    color: '#1565C0',
    fontWeight: '600',
  },

  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },

  weekday: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  sunday: {
    color: '#D32F2F',
  },

  saturday: {
    color: '#1976D2',
  },

  dutyBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 6,
    alignItems: 'center'
  },

  dutyText: {
    fontSize: 22,
    fontWeight: 'bold'
  },

  overrideRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },

  overrideButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8
  },

  overrideText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32'
  },

  clearButton: {
    marginTop: 8,
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center'
  },

  clearText: {
    color: '#C62828',
    fontWeight: '600'
  },

  sub: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  overrideTitle: {
  marginTop: 14,
  fontSize: 14,
  fontWeight: '600',
},

overrideRow: {
  marginTop: 8,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},

overrideButton: {
  backgroundColor: '#E8F5E9',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
},

overrideText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#2E7D32'
},

clearButton: {
  marginTop: 10,
  backgroundColor: '#FFEBEE',
  padding: 8,
  borderRadius: 6,
  alignItems: 'center'
},

clearText: {
  color: '#C62828',
  fontWeight: '600'
},
});