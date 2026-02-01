// App.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { getTodayDuty } from './src/utils/getTodayDuty';

import DutySearchBar from './src/components/DutySearchBar';
import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealInputButtons from './src/components/MealInputButtons';
import TodayRecordList from './src/components/TodayRecordList';
import TodayTimeline from './src/components/TodayTimeline';

export default function App() {
  const [uuid, setUuid] = useState('');
  const [dutyDate, setDutyDate] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        /* UUID */
        let stored = await AsyncStorage.getItem('uuid');
        if (!stored) {
          stored = Crypto.randomUUID();
          await AsyncStorage.setItem('uuid', stored);
        }
        setUuid(stored);

        /* 勤務日 */
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

  if (booting || !uuid || !dutyDate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>起動中...</Text>
      </SafeAreaView>
    );
  }

  const refreshAll = () => setRefreshKey(v => v + 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      >
        <DutySearchBar
          dutyDate={dutyDate}
          onChange={(d) => {
            setDutyDate(d);
            refreshAll();
          }}
        />

        <TodayTotal
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={refreshKey}
        />

        {/* ② 保存後に refreshAll を必ず呼ぶ */}
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { paddingBottom: 24 },
});
