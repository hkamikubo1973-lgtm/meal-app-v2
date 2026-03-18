// src/components/ActionCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TodayActionCard } from '../utils/getTodayActionCard';

import { commonStyles } from '../styles/common';

type Props = {
  card: TodayActionCard;
};

export const ActionCard = ({ card }: Props) => {
  return (
    <View style={commonStyles.container}>
      <View style={[commonStyles.card, styles.highlight]}>

        <Text style={commonStyles.section}>
          本日のアクション
        </Text>

        <Text style={commonStyles.text}>
          {card.message ?? '【DEBUG】ActionCard mounted'}
        </Text>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  /* アクションカード専用の色だけ残す */
  highlight: {
    backgroundColor: '#EAF4FF',
    borderColor: '#90CAF9',
  },

});