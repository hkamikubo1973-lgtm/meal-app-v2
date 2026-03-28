import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { getLogs } from '../database/logs';

type LogType = {
  id: number;
  uuid: string;
  action: string;
  detail: string;
  created_at: string;
};

export default function LogsScreen() {
  const [logs, setLogs] = useState<LogType[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const data = await getLogs();
    setLogs(data as LogType[]);
  };

  return (
    <ScrollView style={styles.container}>
      {logs.map((log) => (
        <View key={log.id} style={styles.card}>
          <Text style={styles.time}>{log.created_at}</Text>
          <Text style={styles.action}>{log.action}</Text>
          <Text style={styles.detail}>
            {formatDetail(log.detail)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* JSON整形（見やすくする） */
const formatDetail = (detail: string) => {
  try {
    return JSON.stringify(JSON.parse(detail), null, 2);
  } catch {
    return detail;
  }
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 10,
  },
  card: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  action: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  detail: {
    fontSize: 12,
    marginTop: 4,
  },
});