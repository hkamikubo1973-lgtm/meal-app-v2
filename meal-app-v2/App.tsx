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
    <SafeAreaView style={styles.container}>
      <ScrollView>

        <TodayTotal
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={reloadKey}
        />

        <RecordInputForm
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setReloadKey(v => v + 1)}
        />

        {/* ★ ここが重要 */}
        <MealInputButtons
          onSaved={async (label) => {
            console.log('MEAL SAVE START', label);
            await insertMealRecord(uuid, dutyDate, label);
            console.log('MEAL SAVE DONE');
            setReloadKey(v => v + 1);
          }}
        />

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
  },
});
