// src/components/ActionCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TodayActionCard } from '../utils/getTodayActionCard';

type Props = {
  card: TodayActionCard;
};

export const ActionCard = ({ card }: Props) => {
  if (!card.message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{card.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 12,
    padding: 14,
    backgroundColor: '#EAF4FF',
    borderRadius: 8,
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
});
