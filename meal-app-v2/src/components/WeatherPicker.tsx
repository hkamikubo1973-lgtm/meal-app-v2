// src/components/WeatherPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  WeatherType,
  updateWeatherByDutyDate,
} from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  onSaved: () => void;
};

const WEATHER: WeatherType[] = ['晴', '曇', '雨', '雪', '荒天'];

export default function WeatherPicker({
  uuid,
  dutyDate,
  onSaved,
}: Props) {
  const save = async (w: WeatherType) => {
    await updateWeatherByDutyDate(uuid, dutyDate, w);
    onSaved();
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>天気</Text>
      <View style={styles.row}>
        {WEATHER.map(w => (
          <TouchableOpacity
            key={w}
            style={styles.btn}
            onPress={() => save(w)}
          >
            <Text>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 12 },
  title: { fontWeight: 'bold', marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  btn: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
});
