import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const formatDate = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

export default function ShiftSearch() {
  const [date, setDate] = useState<Date>(new Date());

  const weekday = WEEKDAYS[date.getDay()];

  const isSunday = date.getDay() === 0;
  const isSaturday = date.getDay() === 6;

  const moveDate = (diff: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + diff);
    setDate(d);
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
          {formatDate(date)}
        </Text>

        <Pressable style={styles.button} onPress={() => moveDate(1)}>
          <Text style={styles.buttonText}>翌日 ▶</Text>
        </Pressable>
      </View>

      {/* 曜日表示 */}
      <Text
        style={[
          styles.weekday,
          isSunday && styles.sunday,
          isSaturday && styles.saturday,
        ]}
      >
        （{weekday}）
      </Text>

      {/* 補足 */}
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
  sub: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
