import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { insertDailyRecord } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  onSaved: () => void;
};

export default function RecordInputForm({ uuid, dutyDate, onSaved }: Props) {
  const [amount, setAmount] = useState('');

  const save = async () => {
    const value = Number(amount);
    if (!value) return;

    console.log('SAVE BUTTON PRESSED', { uuid, dutyDate, value });

    try {
      await insertDailyRecord(uuid, dutyDate, value);
      console.log('DAILY SALES SAVED');
      setAmount('');
      onSaved();
    } catch (e: any) {
      console.error('SALES SAVE ERROR', e);
      Alert.alert('保存失敗', e.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="売上金額"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <Button title="保存" onPress={save} />
    </View>
  );
}
