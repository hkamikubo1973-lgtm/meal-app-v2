import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { getTodayDuty } from './src/utils/getTodayDuty';

import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealTagButtons from './src/components/MealTagButtons';
import TodayRecordList from './src/components/TodayRecordList';

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

  // UUID未確定時は描画しない（白画面防止）
  if (!uuid) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* ★ key が変わると強制再マウント */}
        <TodayTotal
          key={`total-${reloadKey}`}
          uuid={uuid}
          dutyDate={dutyDate}
        />

        <RecordInputForm
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setReloadKey(v => v + 1)}
        />

        <MealTagButtons
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setReloadKey(v => v + 1)}
        />

        <TodayRecordList
          key={`list-${reloadKey}`}
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
