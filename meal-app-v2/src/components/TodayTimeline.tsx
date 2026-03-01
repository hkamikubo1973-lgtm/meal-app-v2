import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import {
  getMealRecordsByDutyDate,
  deleteMealRecord,
} from '../database/mealRecords';
import { MEAL_LABEL_JP } from './mealLabels';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey: number;
};

type MealRecord = {
  id: number;
  meal_label: string;
  created_at: string;
};

/* ===== 時間帯判定 ===== */
const detectTiming = (dateStr: string) => {
  const hour = new Date(dateStr).getHours();

  if (hour >= 5 && hour <= 8) return '朝';
  if (hour >= 11 && hour <= 14) return '昼';
  if (hour >= 17 && hour <= 21) return '夜';
  return '間食';
};

/* ===== 色分け ===== */
const getTimingColor = (timing: string) => {
  switch (timing) {
    case '朝':
      return '#FF9800'; // オレンジ
    case '昼':
      return '#1976D2'; // 青
    case '夜':
      return '#7B1FA2'; // 紫
    default:
      return '#388E3C'; // 緑（間食）
  }
};

export default function TodayTimeline({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {
  const [meals, setMeals] = useState<MealRecord[]>([]);

  useEffect(() => {
    load();
  }, [uuid, dutyDate, refreshKey]);

  const load = async () => {
    const rows = await getMealRecordsByDutyDate(uuid, dutyDate);
    setMeals(rows as MealRecord[]);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      '削除確認',
      'この記録を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deleteMealRecord(id);
            load();
          },
        },
      ]
    );
  };

  if (!uuid || !dutyDate) return null;

  if (meals.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>
          食事記録はまだありません
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {meals.map(m => {
        const time = new Date(m.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const timingLabel = detectTiming(m.created_at);
        const timingColor = getTimingColor(timingLabel);

        return (
          <Pressable
            key={m.id}
            onLongPress={() => handleDelete(m.id)}
            style={styles.itemRow}
          >
            <View style={styles.left}>
              <Text
                style={[
                  styles.timing,
                  { color: timingColor },
                ]}
              >
                [{timingLabel}]
              </Text>

              <Text style={styles.label}>
                {
                  MEAL_LABEL_JP[
                    m.meal_label as keyof typeof MEAL_LABEL_JP
                  ]
                }
              </Text>
            </View>

            <Text style={styles.time}>{time}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  empty: {
    paddingVertical: 8,
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#EEE',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timing: {
    fontSize: 12,
    marginRight: 6,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
});