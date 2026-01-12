// App.tsx（④対応・フル）
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { initDatabase } from './src/database/database';
import RecordInputForm from './src/components/RecordInputForm';
import TodayRecordList from './src/components/TodayRecordList';
import TodayTotal from './src/components/TodayTotal';
import ExportCsvButton from './src/components/ExportCsvButton';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      await initDatabase();
      setDbReady(true);
    })();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RecordInputForm onSaved={() => setRefreshKey((k) => k + 1)} />

      <TodayTotal refreshKey={refreshKey} />

      <ExportCsvButton />

      <TodayRecordList refreshKey={refreshKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
