/**
 * ============================================
 * ⚠ Phase2 安定固定領域（Technical Master Ver.T2）
 * ============================================
 */

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { ensureDailyMealMemoTable } from './src/database/mealRecords';
import { getDutyType } from './src/utils/getDutyType';
import { DutyType } from './src/types/DutyType';
import { getCycleSettings, saveCycleSettings } from './src/database/cycleSettings';
import { setDutyOverride, clearDutyOverride } from './src/database/dutyOverride';
import { initDatabase } from './src/database/database';

import DutySearchBar from './src/components/DutySearchBar';
import DailyMemo from './src/components/DailyMemo';
import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealInputButtons from './src/components/MealInputButtons';
import DailyMealSummary from './src/components/DailyMealSummary';
import TodayTimeline from './src/components/TodayTimeline';
import TodayRecordList from './src/components/TodayRecordList';
import LogsScreen from './src/components/LogsScreen';

const DUTY_LABEL: Record<DutyType, string> = {
  work: '乗務',
  ake: '明け',
  off: '公休',
  paid: '有休',
  absence: '欠勤',
  late: '遅刻',
  leaveEarly: '早退',
  cancel: '取消',
};

export default function App() {

  const DEBUG = true;

  const [booting, setBooting] = useState(true);

  const [uuid, setUuid] = useState<string>('');
  const [dutyDate, setDutyDate] = useState<string>('');
  const [dutyType, setDutyType] = useState<DutyType | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const [jumpText, setJumpText] = useState<string | null>(null);
  const [baseDate, setBaseDate] = useState<string | null>(null);
  const [pattern, setPattern] = useState<DutyType[] | null>(null);

  /* ===============================
     初期化（ここ1本に統一）
  =============================== */
  useEffect(() => {

    const init = async () => {

      try {

        await initDatabase();
        // DBテーブル生成
        await ensureDailyMealMemoTable();

        // UUID生成 or 取得
        let stored = await AsyncStorage.getItem('uuid');

        if (!stored) {
          stored = Crypto.randomUUID();
          await AsyncStorage.setItem('uuid', stored);
        }

        setUuid(stored);

        const today = new Date().toISOString().slice(0, 10);
        setDutyDate(today);

        // サイクル設定読み込み
        const settings = await getCycleSettings(stored);

        if (settings) {
          setBaseDate(settings.base_date);
          setPattern(JSON.parse(settings.pattern_json));
        }

      } catch (e) {

        console.log('initエラー', e);

      } finally {

        setBooting(false);

      }

    };

    init();

  }, []);

  /* ===============================
     dutyType取得
  =============================== */
  useEffect(() => {

    const loadDutyType = async () => {

      if (!uuid || !dutyDate) return;

      const type = await getDutyType(uuid, dutyDate);

      setDutyType(type);

    };

    loadDutyType();

  }, [uuid, dutyDate]);

  const refreshAll = () => setRefreshKey(v => v + 1);

  const showJump = (text: string) => {
    setJumpText(text);
    setTimeout(() => setJumpText(null), 800);
  };

  /* ===============================
     勤務修正
  =============================== */
  const handleOverride = async (type: DutyType) => {

    await setDutyOverride(uuid, dutyDate, type);

    const newType = await getDutyType(uuid, dutyDate);
    setDutyType(newType);

    refreshAll();
  };

  const handleResetOverride = async () => {

    await clearDutyOverride(uuid, dutyDate);

    const newType = await getDutyType(uuid, dutyDate);
    setDutyType(newType);

    refreshAll();
  };

  /* ===============================
     起動ガード
  =============================== */
  if (booting || !uuid || !dutyDate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>起動中...</Text>
      </SafeAreaView>
    );
  }

  /* ===============================
     UI
  =============================== */
  return (

    <SafeAreaView style={styles.safeArea} edges={['top']}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

        <ScrollView
          contentContainerStyle={{ paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >

          <DutySearchBar
            uuid={uuid}
            dutyDate={dutyDate}
            dutyType={dutyType}
            jumpText={jumpText}
            baseDate={baseDate}
            pattern={pattern}
            onChange={(newDate, jumpType) => {
              setDutyDate(newDate);
              refreshAll();
              if (jumpType === 'long-next') showJump('＋30');
              if (jumpType === 'long-prev') showJump('－30');
            }}
            onSavePattern={async (newBaseDate, newPattern) => {
              await saveCycleSettings(uuid, newBaseDate, newPattern, 'cycle');
              setPattern(newPattern);
              setBaseDate(newBaseDate);
            }}
            onSetOverride={handleOverride}
            onResetOverride={handleResetOverride}
          />

          <DailyMemo uuid={uuid} dutyDate={dutyDate} />

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

          {DEBUG && <LogsScreen />}

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});