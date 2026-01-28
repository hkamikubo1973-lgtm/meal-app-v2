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

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },
  buttonText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
  },
});
