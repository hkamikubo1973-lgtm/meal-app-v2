import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type MealSummaryProps = {
  meals: string[]; // ['healthy', 'rice', 'skip' ...]
};

const LABEL_MAP: Record<string, string> = {
  noodle: '麺類',
  rice: 'ご飯もの',
  light: '軽食・パン',
  healthy: '健康・和食',
  supplement: '補給のみ',
  skip: '抜き',
};

export default function MealSummary({ meals }: MealSummaryProps) {
  const [open, setOpen] = useState(false);

  if (!meals || meals.length === 0) {
    return <Text style={styles.empty}>食事：未記録</Text>;
  }

  const uniqueLabels = Array.from(new Set(meals));
  const displayLabels = uniqueLabels
    .map(l => LABEL_MAP[l] ?? l)
    .join(' / ');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Text style={styles.summary}>
          食事：{meals.length}件（{displayLabels}）
        </Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.detail}>
          {meals.map((m, idx) => (
            <Text key={idx} style={styles.detailItem}>
              ・{LABEL_MAP[m] ?? m}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  summary: {
    fontSize: 15,
    fontWeight: '600',
  },
  detail: {
    marginTop: 6,
    paddingLeft: 8,
  },
  detailItem: {
    fontSize: 14,
    color: '#444',
  },
  empty: {
    fontSize: 14,
    color: '#999',
  },
});
