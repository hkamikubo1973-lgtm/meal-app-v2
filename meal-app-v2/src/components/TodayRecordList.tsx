import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  getDailyRecordsByDate,
  BusinessType,
} from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey: number;
};

type Summary = {
  normal: number;
  charter: number;
  other: number;
};

export default function TodayRecordList({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {
  const [summary, setSummary] = useState<Summary>({
    normal: 0,
    charter: 0,
    other: 0,
  });

  useEffect(() => {
    const load = async () => {
      const records = await getDailyRecordsByDate(uuid, dutyDate);

      const s: Summary = {
        normal: 0,
        charter: 0,
        other: 0,
      };

      records.forEach(r => {
        if (r.business_type) {
          s[r.business_type as BusinessType] += r.sales;
        }
      });

      setSummary(s);
    };

    load();
  }, [uuid, dutyDate, refreshKey]);

  const total =
    summary.normal + summary.charter + summary.other;

  if (total === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>売上内訳</Text>

      <Row label="通常" value={summary.normal} />
      <Row label="貸切" value={summary.charter} />
      <Row label="その他" value={summary.other} />
    </View>
  );
}

/* =====================
   小部品
===================== */
function Row({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  if (value === 0) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value.toLocaleString()} 円
      </Text>
    </View>
  );
}

/* =====================
   styles
===================== */
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: '#333',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
  },
});
