import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMealRecordsByDutyDate } from '../database/mealRecords';
import { MealRecord } from '../database/mealRecords';
import { MEAL_LABEL_JP } from './mealLabels';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey?: number;
};

export default function TodayRecordList({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {
  const [records, setRecords] = useState<MealRecord[]>([]);

  useEffect(() => {
    getMealRecordsByDutyDate(uuid, dutyDate).then(setRecords);
  }, [uuid, dutyDate, refreshKey]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <View style={styles.container}>
      {/* 見出し */}
      <Text style={styles.summary}>
        食事（{records.length}回）
      </Text>

      {records.map((record, index) => {
        const isLatest = index === 0;

        return (
          <View
            key={record.id}
            style={[
              styles.row,
              isLatest && styles.latestRow,
            ]}
          >
            <Text
              style={[
                styles.label,
                !isLatest && styles.normalText,
                isLatest && styles.latestText,
              ]}
            >
              {MEAL_LABEL_JP[record.meal_label] ?? record.meal_label}
            </Text>

            <Text
              style={[
                styles.time,
                !isLatest && styles.normalTime,
                isLatest && styles.latestTime,
              ]}
            >
              {formatTime(record.created_at)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },

  /* 見出し */
  summary: {
    fontSize: 16,
    fontWeight: 'normal',
    marginBottom: 4,
  },

  /* 行 */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  /* 通常文字（あえて薄く） */
  normalText: {
    color: '#666',
    fontWeight: 'normal',
  },
  normalTime: {
    color: '#888',
  },

  /* 最新1件 */
  latestRow: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  latestText: {
    fontWeight: 'bold',
    color: '#000',
  },
  latestTime: {
    fontWeight: 'bold',
    color: '#333',
  },

  label: {
    fontSize: 16,
  },
  time: {
    fontSize: 14,
  },
});
