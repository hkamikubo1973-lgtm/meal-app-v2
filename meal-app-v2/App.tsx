import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Alert,
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

const todayString = () =>
  new Date().toISOString().slice(0, 10);

export default function App() {
  const [uuid, setUuid] = useState('');
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [dailyBusinessTotals, setDailyBusinessTotals] =
    useState<DailyBusinessTotal[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const [monthlyBusinessTotals, setMonthlyBusinessTotals] =
    useState<MonthlyBusinessTotal[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayBusinessTotals, setTodayBusinessTotals] =
    useState<
      {
        business_type: 'normal' | 'charter' | 'other';
        total_sales: number;
      }[]
    >([]);
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

  const reloadAll = async () => {
    if (!uuid) return;
    setRecords(await getDailyRecords(uuid));
    setDailyTotals(await getDailyTotals(uuid));
    setDailyBusinessTotals(
      await getDailyBusinessTotals(uuid)
    );
    setMonthlyTotals(await getMonthlyTotals(uuid));
    setMonthlyBusinessTotals(
      await getMonthlyBusinessTotals(uuid)
    );
    setTodayTotal(await getTodayTotal(uuid, dutyDate));
    setTodayBusinessTotals(
      await getTodayBusinessTotals(uuid, dutyDate)
    );
  };

  useEffect(() => {
    reloadAll();
  }, [uuid, dutyDate]);

  const handleSave = async (
    dutyDate: string,
    sales: number,
    businessType: 'normal' | 'charter' | 'other'
  ) => {
    Alert.alert(
      '保存確認',
      `以下の内容で保存しますか？

乗務日：${dutyDate}
売上：${sales.toLocaleString()} 円`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '保存する',
          onPress: async () => {
            await insertDailyRecord(
              uuid,
              dutyDate,
              sales,
              businessType
            );
            await reloadAll();
            setSaveKey((k) => k + 1);
            Alert.alert('保存完了', '売上を保存しました');
          },
        },
      ]
    );
  };

  const handleDelete = async (id: number) => {
    await deleteDailyRecord(id);
    await reloadAll();
    Alert.alert('削除完了', '記録を削除しました');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 12, color: '#666' }}>
          UUID: {uuid.slice(0, 8)}
        </Text>

        <View style={{ marginTop: 12 }}>
          <TodayTotal
            dutyDate={dutyDate}
            total={todayTotal}
            businessTotals={todayBusinessTotals}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <SectionTitle title="売上入力" />
          <RecordInputForm key={saveKey} onSave={handleSave} />
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionTitle title="日別合計（種別別）" />
          <DailyBusinessTotalList
            totals={dailyBusinessTotals}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionTitle title="日別合計（全体）" />
          <DailyTotalList totals={dailyTotals} />
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionTitle title="月次合計（種別別）" />
          <MonthlyBusinessTotalList
            totals={monthlyBusinessTotals}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionTitle title="月次合計（全体）" />
          <MonthlyTotalList totals={monthlyTotals} />
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionTitle title="明細" />
          <DailyRecordList
            records={records}
            onDelete={handleDelete}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionTitle title="CSV出力" />
          <ExportCsvButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
