import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  dutyDate: string;
  dutyType: string;
  jumpText: string | null;
  onChange: (newDate: string, jumpType?: string) => void;
};

export default function DutySearchBar({
  dutyDate,
  dutyType,
  jumpText,
  onChange,
}: Props) {

  const [openCycle, setOpenCycle] = useState(false);

  const changeDateBy = (days: number, jumpType?: string) => {
    const [y, m, d] = dutyDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    date.setDate(date.getDate() + days);

    const newDate =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');

    onChange(newDate, jumpType);
  };

  return (
    <View style={styles.wrapper}>

      {/* ヘッダー */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLeft}>乗務日検索</Text>

        <Text style={styles.headerCenter}>
          {jumpText ?? ''}
        </Text>

        <Text style={styles.headerRight}>
          ※長押しで±30日
        </Text>
      </View>

      {/* 日付行 */}
      <View style={styles.row}>

        <Pressable
          style={styles.button}
          onPress={() => changeDateBy(-1)}
          onLongPress={() => changeDateBy(-30, 'long-prev')}
          delayLongPress={300}
        >
          <Text style={styles.buttonText}>◀ 前日</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.date}>{dutyDate}</Text>
          <Text style={styles.dutyType}>{dutyType}</Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => changeDateBy(1)}
          onLongPress={() => changeDateBy(30, 'long-next')}
          delayLongPress={300}
        >
          <Text style={styles.buttonText}>翌日 ▶</Text>
        </Pressable>

      </View>

      {/* ▼ アコーディオン（UIのみ） */}
      <Pressable
        style={styles.accordionToggle}
        onPress={() => setOpenCycle(v => !v)}
      >
        <Text style={styles.accordionText}>
          {openCycle
            ? '▲ 乗務サイクル設定を閉じる'
            : '▼ 乗務サイクル設定'}
        </Text>
      </Pressable>

      {openCycle && (
        <View style={styles.accordionBox}>
          <Text style={styles.placeholder}>
            ここに基準日とサイクル配列設定UIが入ります。
          </Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 14,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  headerLeft: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  headerCenter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  headerRight: {
    fontSize: 11,
    color: '#888',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  button: {
    paddingVertical: 8,
  },

  buttonText: {
    fontSize: 16,
  },

  center: {
    alignItems: 'center',
  },

  date: {
    fontSize: 22,
    fontWeight: '600',
  },

  dutyType: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },

  accordionToggle: {
    paddingHorizontal: 16,
    marginTop: 10,
  },

  accordionText: {
    fontSize: 14,
    color: '#1976D2',
  },

  accordionBox: {
    marginTop: 6,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  placeholder: {
    fontSize: 13,
    color: '#666',
  },
});