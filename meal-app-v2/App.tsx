import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { getTodayDuty } from './src/utils/getTodayDuty';
import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealInputButtons from './src/components/MealInputButtons';
import TodayRecordList from './src/components/TodayRecordList';

export default function App() {
  const [uuid, setUuid] = useState('');
  const [dutyDate, setDutyDate] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const init = async () => {
      // UUID
      const stored = await AsyncStorage.getItem('uuid');
      if (stored) {
        setUuid(stored);
      } else {
        const u = uuidv4();
        await AsyncStorage.setItem('uuid', u);
        setUuid(u);
      }

      // ★ 今日の日付から乗務日を計算する
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

  // UUID / dutyDate 未確定なら描画しない
  if (!uuid || !dutyDate) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

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

        <MealInputButtons
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
