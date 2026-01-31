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
import { v4 as uuidv4 } from 'uuid';

import { getTodayDuty } from './src/utils/getTodayDuty';

import DutySearchBar from './src/components/DutySearchBar';
import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealInputButtons from './src/components/MealInputButtons';
import TodayRecordList from './src/components/TodayRecordList';
import TodayTimeline from './src/components/TodayTimeline';

export default function App() {
  const [uuid, setUuid] = useState<string>('');
  const [dutyDate, setDutyDate] = useState<string>('');
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [booting, setBooting] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('APP INIT START');

        /* =========
           UUID 初期化
        ========= */
        const stored = await AsyncStorage.getItem('uuid');
        let finalUuid = stored;

        if (!stored) {
          finalUuid = uuidv4();
          await AsyncStorage.setItem('uuid', finalUuid);
        }

        setUuid(finalUuid!);

        /* =========
           勤務日判定
        ========= */
        const today = new Date().toISOString().slice(0, 10);

        let duty: string;
        try {
          duty =
            getTodayDuty({
              baseDate: today,
              standardCycle: ['DUTY', 'OFF'],
            }) ?? today;
        } catch (e) {
          console.warn('getTodayDuty failed, fallback to today');
          duty = today;
        }

        setDutyDate(duty);

        console.log('APP BOOT OK', {
          uuid: finalUuid,
          dutyDate: duty,
        });
      } catch (e) {
        console.error('APP INIT ERROR', e);

        // 最低限の復旧
        const fallbackUuid = uuidv4();
        setUuid(fallbackUuid);
        setDutyDate(new Date().toISOString().slice(0, 10));
      } finally {
        setBooting(false);
      }
    };

    init();
  }, []);

  /* =========
     起動中表示
  ========= */
  if (booting || !uuid || !dutyDate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>起動中...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          uuid={uuid}
          dutyDate={dutyDate}
          onMealRefresh={() => setReloadKey(v => v + 1)}
        />

        {/* タイムライン（売上＋食事） */}
        <TodayTimeline
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={reloadKey}
        />

        {/* 本日の記録一覧 */}
        <TodayRecordList
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={reloadKey}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================
   styles
===================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingBottom: 24,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});
