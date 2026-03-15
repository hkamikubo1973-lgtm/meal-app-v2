import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { setDutyOverride } from '../database/dutyOverride';
import { DutyType } from '../types/DutyType';

type Props = {
  uuid: string;
  dutyDate: string;
  onPrev: () => void;
  onNext: () => void;
  onPrevLong: () => void;
  onNextLong: () => void;
  onRefresh: () => void;
};

export default function DutySearch({
  uuid,
  dutyDate,
  onPrev,
  onNext,
  onPrevLong,
  onNextLong,
  onRefresh,
}: Props) {

  const DUTY_LABEL: Record<DutyType, string> = {
    work: '乗務',
    ake: '明け',
    off: '公休',
    paid: '有休',
    absent: '欠勤',
    late: '遅刻',
    early_leave: '早退',
  };

  const handleOverride = async (type: DutyType) => {
    try {

      await setDutyOverride(uuid, dutyDate, type);

      Alert.alert('勤務修正', DUTY_LABEL[type] + 'を登録しました');

      onRefresh();

    } catch (e) {

      Alert.alert('エラー', '勤務修正保存に失敗しました');

    }
  };

  return (
    <View style={styles.wrapper}>

      <Text style={styles.label}>出番検索</Text>

      <View style={styles.row}>

        {/* 左ボタン */}
        <Pressable
          style={styles.button}
          onPress={onPrev}
          onLongPress={onPrevLong}
          delayLongPress={300}
        >
          <Text style={styles.buttonText}>◀ 前日</Text>
        </Pressable>

        <Text style={styles.date}>{dutyDate}</Text>

        {/* 右ボタン */}
        <Pressable
          style={styles.button}
          onPress={onNext}
          onLongPress={onNextLong}
          delayLongPress={300}
        >
          <Text style={styles.buttonText}>翌日 ▶</Text>
        </Pressable>

      </View>

      {/* 勤務修正 */}

      <View style={styles.overrideBox}>

        <Text style={styles.overrideTitle}>
          勤務修正
        </Text>

        <View style={styles.overrideRow}>

          {(['paid','absent','late','early_leave'] as DutyType[]).map(type => (

            <Pressable
              key={type}
              style={styles.overrideButton}
              onPress={() => handleOverride(type)}
            >

              <Text style={styles.overrideText}>
                {DUTY_LABEL[type]}
              </Text>

            </Pressable>

          ))}

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  wrapper: {
    paddingVertical: 12,
  },

  label: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  buttonText: {
    fontSize: 16,
  },

  date: {
    fontSize: 18,
    fontWeight: '600',
  },

  overrideBox: {
    marginTop: 12,
    alignItems: 'center',
  },

  overrideTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },

  overrideRow: {
    flexDirection: 'row',
    gap: 8,
  },

  overrideButton: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  backgroundColor: '#90CAF9',
  borderRadius: 6,
  marginHorizontal: 4,
},

  overrideText: {
    fontSize: 12,
    fontWeight: '600',
  },

});