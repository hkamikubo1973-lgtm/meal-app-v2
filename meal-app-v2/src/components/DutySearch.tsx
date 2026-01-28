import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  dutyDate: string;
  onPrev: () => void;
  onNext: () => void;
};

export default function DutySearch({
  dutyDate,
  onPrev,
  onNext,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>出番検索</Text>

      <View style={styles.row}>
        <Pressable style={styles.button} onPress={onPrev}>
          <Text style={styles.buttonText}>◀ 前日</Text>
        </Pressable>

        <Text style={styles.date}>{dutyDate}</Text>

        <Pressable style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>翌日 ▶</Text>
        </Pressable>
      </View>
    </View>
  );
}
