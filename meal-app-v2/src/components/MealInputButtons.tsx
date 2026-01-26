import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  onSave: (label: string) => void;
};

const BUTTONS = [
  { label: 'ごはん・丼', value: 'rice' },
  { label: '麺類', value: 'noodle' },
  { label: '軽食・パン', value: 'light' },
  { label: '定食', value: 'healthy', primary: true },
  { label: '補給のみ', value: 'supplement', sub: true },
  { label: '抜き', value: 'skip', sub: true },
];

export default function MealInputButtons({ onSave }: Props) {
  return (
    <View style={styles.container}>
      {BUTTONS.map(btn => (
        <Pressable
          key={btn.value}
          style={[
            styles.button,
            btn.primary && styles.primary,
            btn.sub && styles.sub,
          ]}
          onPress={() => onSave(btn.value)}
        >
          <Text
            style={[
              styles.text,
              btn.primary && styles.primaryText,
            ]}
          >
            {btn.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },

  // 定食（主役）
  primary: {
    backgroundColor: '#e0efe3',
    borderWidth: 1,
    borderColor: '#7fbf90',
  },
  primaryText: {
    fontWeight: '700',
  },

  // 補給・抜き（弱め）
  sub: {
    backgroundColor: '#f7f7f7',
  },
});
