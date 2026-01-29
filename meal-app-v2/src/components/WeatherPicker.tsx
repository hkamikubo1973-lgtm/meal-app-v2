// src/components/WeatherPicker.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import {
  updateWeatherByDutyDate,
  WeatherType,
} from '../database/database';

type Props = {
  visible: boolean;
  uuid: string;
  dutyDate: string;
  onSaved: () => void;
};

const weathers: WeatherType[] = ['晴', '曇', '雨', '雪', '荒天'];

export default function WeatherPicker({
  visible,
  uuid,
  dutyDate,
  onSaved,
}: Props) {
  if (!visible) return null;

  const handleSelect = async (weather: WeatherType | null) => {
    if (!weather) return;

    try {
      await updateWeatherByDutyDate(uuid, dutyDate, weather);
      onSaved();
    } catch (e) {
      console.error('WEATHER SAVE ERROR', e);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>今日の天気は？</Text>

      <View style={styles.buttons}>
        {weathers.map(w => (
          <Pressable
            key={w}
            style={styles.button}
            onPress={() => handleSelect(w)}
          >
            <Text style={styles.text}>{w}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* =====================
   styles
===================== */
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    fontSize: 13,
  },
});
