/**
 * ============================================
 * ⚠ Phase2 安定固定領域（Technical Master Ver.T1）
 * --------------------------------------------
 * このファイルは refreshKey による再描画制御の中核。
 *
 * 変更注意領域：
 * - dutyDate 初期決定ロジック
 * - refreshKey 管理ロジック
 *
 * refreshKey は保存完了後の再描画トリガー。
 * 構造変更時は TodayTotal / Timeline / RecordList 連動確認必須。
 *
 * 単独変更禁止。
 * ============================================
 */

// App.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
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
  const [uuid, setUuid] = useState<string>('');
  const [dutyDate, setDutyDate] = useState<string>('');

  /**
   * 🔁 refreshKey（再描画トリガー）
   *
   * 保存完了後に +1 することで
   * TodayTotal / Timeline / RecordList を再取得させる。
   *
   * 削除・分離・別管理禁止。
   */
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const [booting, setBooting] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        /* UUID（匿名絶縁の基盤） */
        let stored = await AsyncStorage.getItem('uuid');
        if (!stored) {
          stored = Crypto.randomUUID();
          await AsyncStorage.setItem('uuid', stored);
        }
        setUuid(stored);

        /**
         * 🔑 出庫日基準決定（背骨入口）
         *
         * 日跨ぎ吸収のため、表示・保存はこの dutyDate を基準とする。
         * getTodayDuty のロジック変更時は全画面確認必須。
         */
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

  /**
   * 🔁 再描画実行関数
   * 保存成功時のみ呼び出すこと。
   */
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
            refreshAll(); // dutyDate変更時は再描画必須
          }}
        />

        <TodayTotal
          uuid={uuid}
          dutyDate={dutyDate}
          refreshKey={refreshKey}
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
