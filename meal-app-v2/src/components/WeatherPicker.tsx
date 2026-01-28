// src/components/WeatherPicker.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { saveWeather, WeatherType } from '../database/database';

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
    try {
      if (!weather) {
        onSaved();
        return;
      }

      await saveWeather(uuid, dutyDate, weather);
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
            style={styles.weatherButton}
            onPress={() => handleSelect(w)}
          >
            <Text style={styles.weatherText}>{w}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => handleSelect(null)}>
        <Text style={styles.skip}>スキップ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#D6E6FF',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weatherButton: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E6FF',
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  skip: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});
