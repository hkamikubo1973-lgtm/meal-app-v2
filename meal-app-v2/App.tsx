import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { getTodayDuty } from './src/utils/getTodayDuty';

// 🔽 出番検索（復活）
import DutySearchBar from './src/components/DutySearchBar';

import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealInputButtons from './src/components/MealInputButtons';
import TodayRecordList from './src/components/TodayRecordList';

import { insertMealRecord } from './src/database/mealRecords';

export default function App() {
  const [uuid, setUuid] = useState<string>('');
  const [dutyDate, setDutyDate] = useState<string>('');
  const [reloadKey, setReloadKey] = useState<number>(0);

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

      // 初期乗務日算出
      const today = new Date().toISOString().slice(0, 10);
      const duty = getTodayDuty({
        baseDate: today,
        standardCycle: ['DUTY', 'OFF'],
      });

      setDutyDate(duty);
      console.log('APP BOOT OK dutyDate=', duty);
    };

    init();
  }, []);

  // 初期化完了まで描画しない（安全）
  if (!uuid || !dutyDate) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* =====================
            出番検索（最上部）
        ===================== */}
        <DutySearchBar
          dutyDate={dutyDate}
          onChange={(nextDate: string) => {
            setDutyDate(nextDate);
            setReloadKey(v => v + 1); // 全体再読込
          }}
        />

        {/* =====================
            売上表示（選択日）
        ===================== */}
        <TodayTotal
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={reloadKey}
        />

        {/* =====================
            売上入力＋天気
        ===================== */}
        <RecordInputForm
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setReloadKey(v => v + 1)}
        />

        {/* =====================
            食事入力
        ===================== */}
        <MealInputButtons
          onSaved={async (label) => {
            console.log('MEAL SAVE START', label);
            await insertMealRecord(uuid, dutyDate, label);
            console.log('MEAL SAVE DONE');
            setReloadKey(v => v + 1);
          }}
        />

        {/* =====================
            記録一覧
        ===================== */}
        <TodayRecordList
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={reloadKey}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingBottom: 24,
  },
});
