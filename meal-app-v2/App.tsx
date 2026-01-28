import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { getTodayDuty } from './src/utils/getTodayDuty';

import DutySearch from './src/components/DutySearch';
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

      // 乗務日算出
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

  // 初期化完了前は描画しない
  if (!uuid || !dutyDate) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ===== 上部ブロック（出番検索＋本日売上） ===== */}
        <View style={styles.topBlock}>
          <DutySearch />

          <View style={styles.divider} />

          <TodayTotal
            uuid={uuid}
            dutyDate={dutyDate}
            refreshKey={reloadKey}
          />
        </View>

        {/* ===== 売上入力＋天気 ===== */}
        <RecordInputForm
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setReloadKey(v => v + 1)}
        />

        {/* ===== 食事入力 ===== */}
        <MealInputButtons
          onSaved={async (label) => {
            await insertMealRecord(uuid, dutyDate, label);
            setReloadKey(v => v + 1);
          }}
        />

        {/* ===== 本日の記録一覧 ===== */}
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
  container: {
    flex: 1,
    paddingTop: 12, // ← ステータスバー対策（重要）
    backgroundColor: '#FFF',
  },
  scroll: {
    paddingBottom: 24,
  },

  /* ===== 上部まとめブロック ===== */
  topBlock: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#DDD',
  },
});
