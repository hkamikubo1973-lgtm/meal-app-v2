import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

type Props = {
  dutyDate: string;
  onChange: (nextDutyDate: string) => void;
};

const addDays = (date: string, diff: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};

export default function DutySearchBar({
  dutyDate,
  onChange,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>出番検索</Text>

      <View style={styles.row}>
        <Pressable
          style={styles.button}
          onPress={() => onChange(addDays(dutyDate, -1))}
        >
          <Text style={styles.buttonText}>◀ 前日</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.date}>{dutyDate}</Text>
          <Text style={styles.sub}>乗務日</Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => onChange(addDays(dutyDate, 1))}
        >
          <Text style={styles.buttonText}>翌日 ▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 16,        // ← スマホ表示と被らない
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,  // ← TodayTotal と区切る
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#EEF3F7',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    fontSize: 11,
    color: '#666',
  },
});
