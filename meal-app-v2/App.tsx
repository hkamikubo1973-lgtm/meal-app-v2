<<<<<<< HEAD
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import {
  getDailyTotals,
  getDailyBusinessTotals,
  getMonthlyTotals,
  getMonthlyBusinessTotals,
  getTodayTotal,
  DailyTotal,
  DailyBusinessTotal,
  MonthlyTotal,
  MonthlyBusinessTotal,
} from './src/database/database';
=======
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { getTodayDuty } from './src/utils/getTodayDuty';
>>>>>>> c510af0692acee9c11d68de8e3d5d1ecdc02a23a

import TodayTotal from './src/components/TodayTotal';
<<<<<<< HEAD
=======
import RecordInputForm from './src/components/RecordInputForm';
import MealTagButtons from './src/components/MealTagButtons';
>>>>>>> c510af0692acee9c11d68de8e3d5d1ecdc02a23a
import TodayRecordList from './src/components/TodayRecordList';
import MealInputButtons from './src/components/MealInputButtons';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [uuid, setUuid] = useState('');
  const [dutyDate, setDutyDate] = useState(todayISO());

  // ★ これが超重要（再読込用）
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const init = async () => {
      // UUID 初期化
      const stored = await AsyncStorage.getItem('uuid');
      if (stored) {
        setUuid(stored);
      } else {
        const u = uuidv4();
        await AsyncStorage.setItem('uuid', u);
        setUuid(u);
      }

      // 乗務日判定
      const duty = getTodayDuty({
        baseDate: '2026-01-01',
        standardCycle: ['DUTY', 'OFF'],
      });

      setDutyDate(duty);
      console.log('APP BOOT OK', stored);
    };

    init();
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    const loadTotals = async () => {
      setDailyTotals(await getDailyTotals());
      setDailyBusinessTotals(await getDailyBusinessTotals());
      setMonthlyTotals(await getMonthlyTotals());
      setMonthlyBusinessTotals(await getMonthlyBusinessTotals());
      setTodayTotal(await getTodayTotal(dutyDate));
    };
    loadTotals();
  }, [dutyDate, saveKey]);
=======
  // UUID未確定時は描画しない（白画面防止）
  if (!uuid) return null;
>>>>>>> c510af0692acee9c11d68de8e3d5d1ecdc02a23a

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

<<<<<<< HEAD
        {/* 今日の売上（出庫日基準） */}
=======
        {/* ★ key が変わると強制再マウント */}
>>>>>>> c510af0692acee9c11d68de8e3d5d1ecdc02a23a
        <TodayTotal
          key={`total-${reloadKey}`}
          uuid={uuid}
          dutyDate={dutyDate}
        />

        {/* 売上入力 */}
        <RecordInputForm
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setReloadKey(v => v + 1)}
        />

<<<<<<< HEAD
        {/* ★ 食事タグ入力（増築） */}
        <MealInputButtons uuid={uuid} />

        {/* 集計表示 */}
        <DailyBusinessTotalList totals={dailyBusinessTotals} />
        <DailyTotalList totals={dailyTotals} />
        <MonthlyBusinessTotalList totals={monthlyBusinessTotals} />
        <MonthlyTotalList totals={monthlyTotals} />

        {/* 今日の売上・食事一覧 */}
        <TodayRecordList
=======
        <MealTagButtons
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setReloadKey(v => v + 1)}
        />

        <TodayRecordList
          key={`list-${reloadKey}`}
>>>>>>> c510af0692acee9c11d68de8e3d5d1ecdc02a23a
          uuid={uuid}
          dutyDate={dutyDate}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
