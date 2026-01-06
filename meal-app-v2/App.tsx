import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import {
  initDatabase,
  getAllDailyRecords,
  DailyRecord,
} from './src/database/database';

import { DailyRecordList } from './src/components/DailyRecordList';

export default function App() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [status, setStatus] = useState('起動中...');

  useEffect(() => {
    const loadData = async () => {
      try {
        await initDatabase();

        const data = await getAllDailyRecords();
        setRecords(data);

        setStatus('✅ データ読み込み成功');
      } catch (error) {
        console.error(error);
        setStatus('❌ エラーが発生しました');
      }
    };

    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>日次記録一覧</Text>
      <Text style={styles.status}>{status}</Text>

      <DailyRecordList records={records} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  status: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#555',
  },
});
