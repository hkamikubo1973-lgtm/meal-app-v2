/**
 * ============================================
 * ⚠ Phase2 安定固定領域（Technical Master Ver.T1）
 * ============================================
 */

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { getTodayDuty } from './src/utils/getTodayDuty';

import { ensureDailyMealMemoTable } from './src/database/mealRecords';

import DutySearchBar from './src/components/DutySearchBar';
import DailyMemo from './src/components/DailyMemo';
import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealInputButtons from './src/components/MealInputButtons';
import DailyMealSummary from './src/components/DailyMealSummary'; // ← 追加
import TodayTimeline from './src/components/TodayTimeline';
import TodayRecordList from './src/components/TodayRecordList';

export default function App() {
  const [uuid, setUuid] = useState<string>('');
  const [dutyDate, setDutyDate] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [booting, setBooting] = useState<boolean>(true);

  const [jumpText, setJumpText] = useState<string | null>(null);

  /* ============================
     初期化
  ============================ */
  useEffect(() => {
    const init = async () => {
      try {
        // 🔹 新テーブル生成（安全）
        await ensureDailyMealMemoTable();

        let stored = await AsyncStorage.getItem('uuid');

        if (!stored) {
          stored = Crypto.randomUUID();
          await AsyncStorage.setItem('uuid', stored);
        }

        setUuid(stored);

        const today = new Date().toISOString().slice(0, 10);

        const duty =
          getTodayDuty({
            baseDate: today,
            standardCycle: ['DUTY', 'OFF'],
          }) ?? today;

        setDutyDate(duty);
      } finally {
        setBooting(false);
      }
    };

    init();
  }, []);

  /* ============================
     全体リフレッシュ
  ============================ */
  const refreshAll = () => setRefreshKey(v => v + 1);

  /* ============================
     ＋30 / −30 表示
  ============================ */
  const showJump = (text: string) => {
    setJumpText(text);
    setTimeout(() => {
      setJumpText(null);
    }, 800);
  };

  if (booting || !uuid || !dutyDate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>起動中...</Text>
      </SafeAreaView>
    );
  }

  /* ============================
     メインUI
  ============================ */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      >

        <DutySearchBar
          dutyDate={dutyDate}
          dutyType="乗務日"
          jumpText={jumpText}
          onChange={(newDate, jumpType) => {
            setDutyDate(newDate);
            refreshAll();

            if (jumpType === 'long-next') showJump('＋30');
            if (jumpType === 'long-prev') showJump('－30');
          }}
        />

        <DailyMemo
          uuid={uuid}
          dutyDate={dutyDate}
        />

        <TodayTotal
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={refreshKey}
          onRefresh={refreshAll}
        />

        <RecordInputForm
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={refreshAll}
        />

        <MealInputButtons
          uuid={uuid}
          dutyDate={dutyDate}
          onMealRefresh={refreshAll}
        />

        {/* =====================
           今日の食事まとめ
        ===================== */}
        <DailyMealSummary
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={refreshKey}
        />

        <TodayTimeline
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={refreshKey}
        />

        <TodayRecordList
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={refreshKey}
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