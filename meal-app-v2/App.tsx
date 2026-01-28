// App.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { getTodayDuty } from './src/utils/getTodayDuty';

import DutySearchBar from './src/components/DutySearchBar';
import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealInputButtons from './src/components/MealInputButtons';
import TodayRecordList from './src/components/TodayRecordList';

import { insertMealRecord } from './src/database/mealRecords';

export default function App() {
  const [uuid, setUuid] = useState('');
  const [dutyDate, setDutyDate] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const init = async () => {
      const stored = await AsyncStorage.getItem('uuid');
      if (stored) {
        setUuid(stored);
      } else {
        const u = uuidv4();
        await AsyncStorage.setItem('uuid', u);
        setUuid(u);
      }

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

  if (!uuid || !dutyDate) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* 出番検索 */}
        <DutySearchBar
          dutyDate={dutyDate}
          onChange={(nextDate) => {
            setDutyDate(nextDate);
            setReloadKey(v => v + 1);
          }}
        />

        {/* 売上サマリ */}
        <TodayTotal
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={reloadKey}
          onRefresh={() => setReloadKey(v => v + 1)}
        />

        {/* 売上入力 */}
        <RecordInputForm
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setReloadKey(v => v + 1)}
        />

        {/* 食事入力 */}
        <MealInputButtons
          onSaved={async (label) => {
            await insertMealRecord(uuid, dutyDate, label);
            setReloadKey(v => v + 1);
          }}
        />

        {/* 本日の記録 */}
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
