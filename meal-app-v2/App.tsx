import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import {
  getDailyTotals,
  getDailyBusinessTotals,
  getMonthlyTotals,
  getMonthlyBusinessTotals,
  getTodayTotal,
  DailyTotal,
  DailyBusinessTotal,
  MonthlyTotal,
  MonthlyBusinessTotal,
} from './src/database/database';

import RecordInputForm from './src/components/RecordInputForm';
import DailyRecordList from './src/components/DailyRecordList';
import DailyTotalList from './src/components/DailyTotalList';
import DailyBusinessTotalList from './src/components/DailyBusinessTotalList';
import MonthlyTotalList from './src/components/MonthlyTotalList';
import MonthlyBusinessTotalList from './src/components/MonthlyBusinessTotalList';
import TodayTotal from './src/components/TodayTotal';
import TodayRecordList from './src/components/TodayRecordList';
import MealInputButtons from './src/components/MealInputButtons';

const todayString = () =>
  new Date().toISOString().slice(0, 10);

export default function App() {
  const [uuid, setUuid] = useState('');
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [dailyBusinessTotals, setDailyBusinessTotals] =
    useState<DailyBusinessTotal[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const [monthlyBusinessTotals, setMonthlyBusinessTotals] =
    useState<MonthlyBusinessTotal[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [dutyDate, setDutyDate] = useState(todayString());
  const [saveKey, setSaveKey] = useState(0);

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
    };
    init();
  }, []);

  useEffect(() => {
    const loadTotals = async () => {
      setDailyTotals(await getDailyTotals());
      setDailyBusinessTotals(await getDailyBusinessTotals());
      setMonthlyTotals(await getMonthlyTotals());
      setMonthlyBusinessTotals(await getMonthlyBusinessTotals());
      setTodayTotal(await getTodayTotal(dutyDate));
    };
    loadTotals();
  }, [dutyDate, saveKey]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* 今日の売上（出庫日基準） */}
        <TodayTotal
          total={todayTotal}
          dutyDate={dutyDate}
        />

        {/* 売上入力 */}
        <RecordInputForm
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setSaveKey(v => v + 1)}
        />

        {/* ★ 食事タグ入力（増築） */}
        <MealInputButtons uuid={uuid} />

        {/* 集計表示 */}
        <DailyBusinessTotalList totals={dailyBusinessTotals} />
        <DailyTotalList totals={dailyTotals} />
        <MonthlyBusinessTotalList totals={monthlyBusinessTotals} />
        <MonthlyTotalList totals={monthlyTotals} />

        {/* 今日の売上・食事一覧 */}
        <TodayRecordList
          uuid={uuid}
          dutyDate={dutyDate}
          key={saveKey}
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
