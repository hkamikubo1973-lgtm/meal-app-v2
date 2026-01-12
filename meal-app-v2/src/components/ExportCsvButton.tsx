import { View, Button, StyleSheet, Alert } from 'react-native';
import { exportRecordsCsv } from '../utils/exportCsv';

export default function ExportCsvButton() {
  const onPress = async () => {
    try {
      await exportRecordsCsv();
    } catch (e) {
      console.error(e);
      Alert.alert('エラー', 'CSV出力に失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="CSV出力" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
