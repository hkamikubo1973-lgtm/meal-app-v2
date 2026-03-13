import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { DutyType } from '../types/DutyType';

type Props = {
  uuid: string;
  dutyDate: string;
  dutyType: string;
  jumpText: string | null;
  baseDate: string | null;
  pattern: DutyType[] | null;
  onChange: (
    newDate: string,
    jumpType?: 'prev' | 'next' | 'long-prev' | 'long-next'
  ) => void;
  onSavePattern: (
    baseDate: string,
    pattern: DutyType[]
  ) => Promise<void>;
};

export default function DutySearchBar({
  dutyDate,
  dutyType,
  jumpText,
  baseDate,
  pattern,
  onChange,
  onSavePattern,
}: Props) {
  const [openCycle, setOpenCycle] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localPattern, setLocalPattern] = useState<DutyType[] | null>(pattern);
  const [localBaseDate, setLocalBaseDate] = useState(baseDate ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalPattern(pattern);
  }, [pattern]);

  useEffect(() => {
    setLocalBaseDate(baseDate ?? '');
  }, [baseDate]);

  const DUTY_LABEL: Record<DutyType, string> = {
    work: '乗務日',
    off: '公休',
    public: '公出',
    paid: '有休',
  };

  const nextDuty = (type: DutyType): DutyType => {
    const order: DutyType[] = ['work', 'off', 'public', 'paid'];
    const idx = order.indexOf(type);
    return order[(idx + 1) % order.length];
  };

  const cycleInfo = React.useMemo(() => {
    if (!baseDate || !pattern || pattern.length === 0) {
      return null;
    }

    const base = new Date(baseDate);
    const current = new Date(dutyDate);

    const diff =
      Math.floor(
        (current.getTime() - base.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    const length = pattern.length;

    const index =
      ((diff % length) + length) % length;

    return {
      day: index + 1,
      total: length,
      label: pattern[index],
    };
  }, [baseDate, dutyDate, pattern]);

  const progressArray = React.useMemo(() => {
    if (!cycleInfo) return [];

    return Array.from({ length: cycleInfo.total }).map(
    (_, index) => index < cycleInfo.day
    );
  }, [cycleInfo]);

  const changeDateBy = (days: number, jumpType?: string) => {
    const [y, m, d] = dutyDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);

    const newDate =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');

    onChange(newDate, jumpType as any);
  };

  const isValidDate = (value: string) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  };

  const handleSave = async () => {
    if (!localPattern) return;

    if (!isValidDate(localBaseDate)) {
      Alert.alert('基準日は YYYY-MM-DD 形式で入力してください');
      return;
    }

    try {
      setSaving(true);
      await onSavePattern(localBaseDate, localPattern);
      setEditMode(false);
      Alert.alert('保存しました');
    } catch (e) {
      Alert.alert('保存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLeft}>乗務日検索</Text>
        <Text style={styles.headerCenter}>{jumpText ?? ''}</Text>
        <Text style={styles.headerRight}>※長押しで±30日</Text>
      </View>

      <View style={styles.row}>
        <Pressable
          style={styles.button}
          onPress={() => changeDateBy(-1)}
          onLongPress={() => changeDateBy(-30, 'long-prev')}
        >
          <Text style={styles.buttonText}>◀ 前日</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.date}>{dutyDate}</Text>
          <Text style={styles.dutyType}>{dutyType}</Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => changeDateBy(1)}
          onLongPress={() => changeDateBy(30, 'long-next')}
        >
          <Text style={styles.buttonText}>翌日 ▶</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.accordionToggle}
        onPress={() => setOpenCycle(v => !v)}
      >
        <Text style={styles.accordionText}>
          {openCycle
            ? '▲ 乗務サイクル設定を閉じる'
            : '▼ 乗務サイクル設定'}
        </Text>
      </Pressable>

      {openCycle && (
        <View style={styles.accordionBox}>
          <Text style={styles.label}>基準日</Text>

          {!editMode ? (
            <Text style={styles.value}>
              {localBaseDate || '未設定'}
            </Text>
          ) : (
            <TextInput
              value={localBaseDate}
              onChangeText={setLocalBaseDate}
              style={styles.input}
              placeholder="YYYY-MM-DD"
            />
          )}

      {cycleInfo && (
         <Text style={styles.cycleInfo}>
           サイクル {cycleInfo.day} / {cycleInfo.total} 日目
         （{DUTY_LABEL[cycleInfo.label]}）
         </Text>
      )}
      
      {cycleInfo && (
        <View style={styles.progressRow}>
           {progressArray.map((active, index) => (
            <View
              key={index}
              style={[
                styles.progressBlock,
                active && styles.progressBlockActive,
              ]}
            />
          ))}
        </View>
      )}

          {localPattern && (
            <>
              <Text style={[styles.label, { marginTop: 14 }]}>
                パターン
              </Text>

              <View style={styles.patternRow}>
                {localPattern.map((type, index) => (
                  <Pressable
                    key={index}
                    disabled={!editMode}
                    onPress={() => {
                      const updated = [...localPattern];
                      updated[index] = nextDuty(type);
                      setLocalPattern(updated);
                    }}
                    style={[
                      styles.patternChip,
                      editMode && styles.patternChipEdit,
                    ]}
                  >
                    <Text style={styles.patternText}>
                      {DUTY_LABEL[type]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {!editMode ? (
                <Pressable
                  style={styles.editButton}
                  onPress={() => setEditMode(true)}
                >
                  <Text style={styles.editButtonText}>
                    パターン編集
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.saveRow}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => {
                      setLocalPattern(pattern);
                      setLocalBaseDate(baseDate ?? '');
                      setEditMode(false);
                    }}
                  >
                    <Text>キャンセル</Text>
                  </Pressable>

                  <Pressable
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    <Text style={{ color: '#fff' }}>
                      {saving ? '保存中...' : '保存'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 14 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeft: { fontSize: 18, fontWeight: 'bold' },
  headerCenter: { fontSize: 16, fontWeight: '600' },
  headerRight: { fontSize: 11, color: '#888' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  button: { paddingVertical: 8 },
  buttonText: { fontSize: 16 },
  center: { alignItems: 'center' },
  date: { fontSize: 22, fontWeight: '600' },
  dutyType: { fontSize: 13, marginTop: 2 },
  accordionToggle: { paddingHorizontal: 16, marginTop: 12 },
  accordionText: { fontSize: 14, color: '#1976D2' },
  accordionBox: {
    marginTop: 6,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  label: { fontSize: 12, color: '#666' },
  value: { fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  patternChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  patternChipEdit: { backgroundColor: '#BBDEFB' },
  patternText: { fontSize: 14, fontWeight: '600' },
  editButton: { marginTop: 10 },
  editButtonText: { color: '#1976D2', fontWeight: '600' },
  saveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: { padding: 8 },
  saveButton: {
    padding: 8,
    backgroundColor: '#1976D2',
    borderRadius: 6,
  },
  cycleInfo: {
  marginTop: 6,
  fontSize: 13,
  color: '#555',
  fontWeight: '600',
  },
  progressRow: {
  flexDirection: 'row',
  marginTop: 6,
  },

progressBlock: {
  width: 18,
  height: 6,
  marginRight: 4,
  borderRadius: 3,
  backgroundColor: '#E0E0E0',
},

progressBlockActive: {
  backgroundColor: '#1976D2',
},
});