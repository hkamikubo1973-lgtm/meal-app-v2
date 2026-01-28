import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import { getTodayDuty } from '../utils/getTodayDuty';

export default function DutySearch() {
  const [baseDate, setBaseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const duty = getTodayDuty({
    baseDate,
    standardCycle: ['DUTY', 'OFF'],
  });

  const moveDay = (diff: number) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + diff);
    setBaseDate(d.toISOString().slice(0, 10));
  };

  const dateObj = new Date(baseDate);
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];

  return (
    <View style={styles.container}>
      {/* ===== タイトル ===== */}
      <Text style={styles.title}>出番検索</Text>

      {/* ===== 日付表示 ===== */}
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>
          {baseDate}（{weekday}）
        </Text>
      </View>

      {/* ===== 前日・翌日 ===== */}
      <View style={styles.navRow}>
        <Pressable style={styles.navButton} onPress={() => moveDay(-1)}>
          <Text style={styles.navText}>◀ 前日</Text>
        </Pressable>

        <Pressable style={styles.navButton} onPress={() => moveDay(1)}>
          <Text style={styles.navText}>翌日 ▶</Text>
        </Pressable>
      </View>

      {/* ===== 出番結果 ===== */}
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>出番：</Text>
        <Text style={styles.resultValue}>
          {duty === 'DUTY' ? '出勤' : '休み'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 6,
  },

  dateRow: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  navText: {
    fontSize: 14,
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#555',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
