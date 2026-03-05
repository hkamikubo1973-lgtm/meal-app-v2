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

import { getTodayDuty } from './src/utils/getTodayDuty';
import { ensureDailyMealMemoTable } from './src/database/mealRecords';

import { getDutyType } from './src/utils/getDutyType';
import { DutyType } from './src/types/DutyType';
import { getCycleSettings, saveCycleSettings } from './src/database/cycleSettings';
import DutySearchBar from './src/components/DutySearchBar';
import DailyMemo from './src/components/DailyMemo';
import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealInputButtons from './src/components/MealInputButtons';
import DailyMealSummary from './src/components/DailyMealSummary';
import TodayTimeline from './src/components/TodayTimeline';
import TodayRecordList from './src/components/TodayRecordList';

const DUTY_LABEL: Record<DutyType, string> = {
  work: '乗務日',
  off: '公休',
  public: '公出',
  paid: '有休',
};

export default function App() {
  const [uuid, setUuid] = useState<string>('');
  const [dutyDate, setDutyDate] = useState<string>('');
  const [dutyType, setDutyType] = useState<DutyType | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [booting, setBooting] = useState<boolean>(true);
  const [jumpText, setJumpText] = useState<string | null>(null);
  const [baseDate, setBaseDate] = useState<string | null>(null);

  const resetBaseDateToToday = async () => {
  console.log("押された");

  if (!uuid) {
    console.log("uuidなし");
    return;
  }

  const settings = await getCycleSettings(uuid);
  console.log("settings:", settings);

  if (!settings) {
    console.log("settingsなし");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  console.log("today:", today);

  await saveCycleSettings(
    uuid,
    today,
    JSON.parse(settings.pattern_json),
    settings.mode
  );

  console.log("保存完了");

  setBaseDate(today);
  setDutyDate(today);
  refreshAll();
};

  /* ===============================
     初期化
  =============================== */
  useEffect(() => {
    const init = async () => {
      try {
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

  /* ==========================
     基準日読み込み
  ========================== */
  useEffect(() => {
    const loadBaseDate = async () => {
      if (!uuid) return;

      const settings = await getCycleSettings(uuid);
      if (settings) {
        setBaseDate(settings.base_date);
      }
    };

    loadBaseDate();
  }, [uuid]);

  /* ===============================
     dutyType取得（安全表示専用）
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

  if (booting || !uuid || !dutyDate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>起動中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <DutySearchBar
            dutyDate={dutyDate}
            dutyType={
              dutyType ? DUTY_LABEL[dutyType] : '...'
            }
            jumpText={jumpText}
            onChange={(newDate, jumpType) => {
              setDutyDate(newDate);
              refreshAll();
              if (jumpType === 'long-next') showJump('＋30');
              if (jumpType === 'long-prev') showJump('－30');
            }}
        />
<Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20 }}>
  ■ 乗務サイクル設定（表示テスト）
</Text>

<Text style={{ marginTop: 8 }}>
  基準日: {baseDate ?? '未設定'}
</Text>
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
          <Text
            style={{
                  textAlign: 'center',
                      color: 'blue',
    marginVertical: 20,
  }}
  onPress={resetBaseDateToToday}
>
  基準日を今日にリセット（テスト）
</Text>
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
  container: {
    flexGrow: 1,
    paddingBottom: 120,
  },
});