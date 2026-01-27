import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  getTodayTotal,
  getDailySalesSummaryByDutyDate,
  getWeatherByDutyDate,
  WeatherType,
} from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey?: number;
};

export default function TodayTotal({
  uuid,
  dutyDate,
  refreshKey = 0,
}: Props) {
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<{
    normal: number;
    charter: number;
    other: number;
  } | null>(null);

  const [weather, setWeather] = useState<WeatherType | null>(null);
  const [open, setOpen] = useState(false);

  const getWeekdayJP = (dateStr: string) => {
    const d = new Date(dateStr);
    const weeks = ['日', '月', '火', '水', '木', '金', '土'];
    return weeks[d.getDay()];
  };

  useEffect(() => {
    const load = async () => {
      const t = await getTodayTotal(uuid, dutyDate);
      setTotal(t ?? 0);

      const s = await getDailySalesSummaryByDutyDate(uuid, dutyDate);
      setSummary(s);

      const w = await getWeatherByDutyDate(uuid, dutyDate);
      setWeather(w);
    };
    load();
  }, [uuid, dutyDate, refreshKey]);

  return (
    <Pressable
      onPress={() => setOpen((prev) => !prev)}
      style={styles.box}
    >
      {/* タイトル＋日付 */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>本日の売上</Text>
        <Text style={styles.dateInline}>
          出庫日：{dutyDate}（{getWeekdayJP(dutyDate)}）
        </Text>
      </View>

      {/* 天気（あれば表示） */}
      {weather && (
        <Text style={styles.weather}>
          天気：{weather}
        </Text>
      )}

      {/* 合計 */}
      <Text style={styles.total}>
        {total.toLocaleString()} 円
      </Text>

      {/* ヒント */}
      <Text style={styles.hint}>
        {open ? '▲ タッチで詳細を閉じる' : '▼ 詳細はタッチして表示'}
      </Text>

      {/* 詳細 */}
      {open && summary && (
        <View style={styles.detail}>
          <Text style={styles.detailRow}>
            通常：{summary.normal.toLocaleString()} 円
          </Text>
          <Text style={styles.detailRow}>
            貸切：{summary.charter.toLocaleString()} 円
          </Text>
          <Text style={styles.detailRow}>
            その他：{summary.other.toLocaleString()} 円
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#F4F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  dateInline: {
    fontSize: 12,
    color: '#666',
  },
  weather: {
    marginTop: 4,
    fontSize: 12,
    color: '#1565C0',
    fontWeight: '600',
  },
  total: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 6,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    color: '#555',
  },
  detail: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  detailRow: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
});
