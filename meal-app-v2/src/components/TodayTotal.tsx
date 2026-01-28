import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import {
  getTodayTotalSales,
  getTodayWeather,
  getTodaySalesByType,
} from '../database/database';

/* =====================
   設定（安全：固定値）
===================== */
const TARGET_SALES = 15000;

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey: number;
};

type SalesByType = {
  normal: number;
  charter: number;
  other: number;
};

export default function TodayTotal({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {
  const [totalSales, setTotalSales] = useState<number>(0);
  const [weather, setWeather] = useState<string | null>(null);
  const [salesByType, setSalesByType] =
    useState<SalesByType>({
      normal: 0,
      charter: 0,
      other: 0,
    });
  const [open, setOpen] = useState<boolean>(true);

  /* =====================
     load
  ===================== */
  useEffect(() => {
    const load = async () => {
      try {
        const sales = await getTodayTotalSales(uuid, dutyDate);
        const w = await getTodayWeather(uuid, dutyDate);
        const byType =
          (await getTodaySalesByType(uuid, dutyDate)) ?? {
            normal: 0,
            charter: 0,
            other: 0,
          };

        setTotalSales(sales ?? 0);
        setWeather(w);
        setSalesByType(byType);
      } catch (e) {
        console.error('TODAY TOTAL LOAD ERROR', e);
      }
    };

    load();
  }, [uuid, dutyDate, refreshKey]);

  const remaining = TARGET_SALES - totalSales;

  /* =====================
     render
  ===================== */
  return (
    <View style={styles.wrapper}>

      {/* 売上目標 */}
      <View style={styles.card}>
        <Text style={styles.title}>本日の売上目標</Text>

        <Text style={styles.amount}>
          {TARGET_SALES.toLocaleString()} 円
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
      </View>

      {/* 本日の売上 */}
      <View style={styles.card}>
        <Text style={styles.title}>本日の売上</Text>

        <Text style={styles.sub}>
          出庫日：{dutyDate}
        </Text>

        {weather && (
          <Text style={styles.weather}>
            天気：{weather}
          </Text>
        )}

        <Text style={styles.amount}>
          {totalSales.toLocaleString()} 円
        </Text>

        <Pressable onPress={() => setOpen(v => !v)}>
          <Text style={styles.toggle}>
            {open ? '▲ 閉じる' : '▼ 詳細はタッチして表示'}
          </Text>
        </Pressable>

        {open && (
          <View style={styles.detailBox}>
            <View style={styles.row}>
              <Text style={styles.label}>通常</Text>
              <Text style={styles.value}>
                {salesByType.normal.toLocaleString()} 円
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>貸切</Text>
              <Text style={styles.value}>
                {salesByType.charter.toLocaleString()} 円
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>その他</Text>
              <Text style={styles.value}>
                {salesByType.other.toLocaleString()} 円
              </Text>
            </View>
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
  weather: {
    fontSize: 13,
    color: '#1976D2',
    marginTop: 2,
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
    marginTop: 4,
  },
  detailBox: {
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: '#DDD',
    paddingTop: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  label: {
    fontSize: 13,
    color: '#444',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
  },
});
