// src/components/TodayTotal.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';

import {
  getTodayTotalSales,
  getMonthlyTotalSales,
  getDailySalesSummaryByDutyDate,
  getTodayWeather,
  updateWeatherByDutyDate,
  insertDailyRecord,
} from '../database/database';

/* =====================
   月次目標
===================== */
const MONTHLY_TARGET = 300000;

const WEATHER_LIST = ['晴', '曇', '雨', '雪', '荒天'] as const;
type WeatherType = typeof WEATHER_LIST[number];

type Props = {
  uuid: string;
  dutyDate: string;
  salesRefreshKey: number;
  onSalesRefresh: () => void;
};

export default function TodayTotal({
  uuid,
  dutyDate,
  salesRefreshKey,
  onSalesRefresh,
}: Props) {
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [summary, setSummary] = useState<{
    normal: number;
    charter: number;
    other: number;
  } | null>(null);
  const [weather, setWeather] = useState<WeatherType | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const today = await getTodayTotalSales(uuid, dutyDate);
    const month = await getMonthlyTotalSales(uuid, dutyDate);
    const sum = await getDailySalesSummaryByDutyDate(uuid, dutyDate);
    const w = await getTodayWeather(uuid, dutyDate);

    setTodayTotal(today);
    setMonthTotal(month);
    setSummary(sum);
    setWeather(w);
  };

  useEffect(() => {
    load();
  }, [uuid, dutyDate, salesRefreshKey]);

  const remaining = MONTHLY_TARGET - monthTotal;

  /* =====================
     天気保存（sales専用）
  ===================== */
  const handleWeatherSelect = async (w: WeatherType) => {
    await updateWeatherByDutyDate(uuid, dutyDate, w);
    setWeather(w);
    onSalesRefresh();
  };

  /* =====================
     本日の売上リセット
     ※ マイナス売上で履歴を残す設計
  ===================== */
  const handleReset = async () => {
    Alert.alert(
      '売上リセット',
      '本日の売上をすべて削除します。\nこの操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            if (todayTotal !== 0) {
              await insertDailyRecord(
                uuid,
                dutyDate,
                -todayTotal,
                'other'
              );
              onSalesRefresh(); // 親に完全委譲
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* ===== 今月の目標 ===== */}
      <View style={styles.card}>
        <Text style={styles.title}>今月の売上目標</Text>
        <Text style={styles.amount}>
          {MONTHLY_TARGET.toLocaleString()} 円
        </Text>
        <Text
          style={[
            styles.remaining,
            remaining <= 0 && styles.remainingOk,
          ]}
        >
          {remaining > 0
            ? `あと ${remaining.toLocaleString()} 円`
            : '達成 🎉'}
        </Text>
        <Text style={styles.sub}>
          今月累計：{monthTotal.toLocaleString()} 円
        </Text>
      </View>

      {/* ===== 本日の売上 ===== */}
      <View style={styles.card}>
        <Text style={styles.title}>本日の売上</Text>
        <Text style={styles.sub}>出庫日：{dutyDate}</Text>

        <Text style={styles.amount}>
          {todayTotal.toLocaleString()} 円
        </Text>

        {/* 天気選択 */}
        <View style={styles.weatherRow}>
          {WEATHER_LIST.map(w => (
            <Pressable
              key={w}
              onPress={() => handleWeatherSelect(w)}
              style={[
                styles.weatherButton,
                weather === w && styles.weatherSelected,
              ]}
            >
              <Text>{w}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => setOpen(v => !v)}>
          <Text style={styles.toggle}>
            {open ? '▲ 詳細を閉じる' : '▼ 詳細・売上リセット'}
          </Text>
        </Pressable>

        {/* ▼ 詳細表示（0円のときは出さない） */}
        {open && summary && todayTotal !== 0 && (
          <View style={styles.detail}>
            <Text>通常：{summary.normal.toLocaleString()} 円</Text>
            <Text>貸切：{summary.charter.toLocaleString()} 円</Text>
            <Text>その他：{summary.other.toLocaleString()} 円</Text>

            <Pressable style={styles.reset} onPress={handleReset}>
              <Text style={styles.resetText}>
                本日の売上をリセット
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

/* =====================
   styles
===================== */
const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sub: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  remaining: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  remainingOk: {
    color: '#2E7D32',
  },
  toggle: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
  },
  detail: {
    marginTop: 6,
  },
  weatherRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  weatherButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  weatherSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  reset: {
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E57373',
    backgroundColor: '#FDECEA',
  },
  resetText: {
    color: '#C62828',
    fontWeight: '600',
    textAlign: 'center',
  },
});
