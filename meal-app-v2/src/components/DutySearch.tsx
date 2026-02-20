import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  dutyDate: string;
  onPrev: () => void;
  onNext: () => void;
  onPrevLong: () => void;   // ← 追加
  onNextLong: () => void;   // ← 追加
};

export default function DutySearch({
  dutyDate,
  onPrev,
  onNext,
  onPrevLong,
  onNextLong,
}: Props) {

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>出番検索</Text>

      <View style={styles.row}>

        {/* 左ボタン */}
        <Pressable
          style={styles.button}
          onPress={onPrev}
          onLongPress={onPrevLong}
          delayLongPress={300}
        >
          <Text style={styles.buttonText}>◀ 前日</Text>
        </Pressable>

        <Text style={styles.date}>{dutyDate}</Text>

        {/* 右ボタン */}
        <Pressable
          style={styles.button}
          onPress={onNext}
          onLongPress={onNextLong}
          delayLongPress={300}
        >
          <Text style={styles.buttonText}>翌日 ▶</Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 12,
  },
  label: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 16,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
  },
});