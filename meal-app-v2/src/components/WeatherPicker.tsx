import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  WeatherType,
  updateWeatherByDutyDate,
  getTodayWeather,
} from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
};

const weatherOptions: WeatherType[] = ['晴', '曇', '雨', '雪', '荒天'];

export default function WeatherPicker({ uuid, dutyDate }: Props) {
  const [selected, setSelected] = useState<WeatherType | null>(null);

  const loadWeather = async () => {
    const w = await getTodayWeather(uuid, dutyDate);
    setSelected(w);
  };

  useEffect(() => {
    loadWeather();
  }, [dutyDate]);

  const onSelect = async (w: WeatherType) => {
    await updateWeatherByDutyDate(uuid, dutyDate, w);
    setSelected(w);
  };

  return (
    <View style={styles.container}>
      {weatherOptions.map(w => (
        <TouchableOpacity
          key={w}
          onPress={() => onSelect(w)}
          style={[
            styles.button,
            selected === w && styles.selected,
          ]}
        >
          <Text
            style={[
              styles.text,
              selected === w && styles.selectedText,
            ]}
          >
            {w}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  selected: {
    backgroundColor: '#e6f0ff',
    borderColor: '#3b82f6',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
