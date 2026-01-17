import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import {
  insertDailyRecord,
  deleteDailyRecord,
  getDailyRecords,
  getDailyTotals,
  getDailyBusinessTotals,
  getMonthlyTotals,
  getMonthlyBusinessTotals,
  getTodayTotal,
  getTodayBusinessTotals,
  DailyRecord,
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
import ExportCsvButton from './src/components/ExportCsvButton';
import SectionTitle from './src/components/SectionTitle';
import TodayRecordList from './src/components/TodayRecordList';

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
      if (stored) setUuid(stored);
      else {
        const u = uuidv4();
        await AsyncStorage.setItem('uuid', u);
        setUuid(u);
      }
    };
    init();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        <TodayTotal
          total={todayTotal}
          dutyDate={dutyDate}
        />

        <RecordInputForm
          uuid={uuid}
          dutyDate={dutyDate}
          onSaved={() => setSaveKey(v => v + 1)}
        />

        <DailyBusinessTotalList totals={dailyBusinessTotals} />
        <DailyTotalList totals={dailyTotals} />
        <MonthlyBusinessTotalList totals={monthlyBusinessTotals} />
        <MonthlyTotalList totals={monthlyTotals} />

        {/* ★ 今日の食事・売上表示 */}
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
