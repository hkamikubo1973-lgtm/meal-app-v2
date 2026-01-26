import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { getTodayDuty } from './src/utils/getTodayDuty';

import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealTagButtons from './src/components/MealTagButtons';
import TodayRecordList from './src/components/TodayRecordList';
import TodaySalesList from './src/components/TodaySalesList'; 
import TodayTimeline from './src/components/TodayTimeline';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [uuid, setUuid] = useState<string>('');
  const [dutyDate, setDutyDate] = useState<string>(todayISO());

  // ★ 再読み込みトリガ（売上・食事 共通）
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

  // UUID 未確定時は描画しない（白画面防止）
  if (!uuid) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* 今日の売上（出庫日基準・合計） */}
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

        {/* ★ 今日の売上履歴（時系列） */}
        <TodaySalesList
          key={`sales-${reloadKey}`}
          uuid={uuid}
          dutyDate={dutyDate}
        />

        {/* 食事タグ入力 */}
        <MealTagButtons
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setReloadKey(v => v + 1)}
        />

        {/* 今日の食事一覧 */}
        <TodayRecordList
          key={`meal-${reloadKey}`}
          uuid={uuid}
          dutyDate={dutyDate}
        />
        <TodayTimeline
          key={`timeline-${reloadKey}`}
          uuid={uuid}
          dutyDate={dutyDate}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
