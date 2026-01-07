import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native'

import RecordInputForm from './src/components/RecordInputForm'
import DailyRecordList from './src/components/DailyRecordList'
import { initDatabase, addRecord, getAllRecords } from './src/database/database'
import { exportMonthlyCsv } from './src/utils/exportCsv'
import { DailyRecord } from './src/types/DailyRecord'

export default function App() {
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    initDatabase().then(loadRecords)
  }, [])

  const loadRecords = async () => {
    const data = await getAllRecords()
    setRecords(data)
  }

  const handleSave = async (
    sales: number,
    healthScore: number,
    memo?: string
  ) => {
    try {
      await addRecord({
        date: new Date().toISOString().slice(0, 10),
        sales,
        healthScore,
        memo,
      })
      await loadRecords()
    } catch (e: any) {
      Alert.alert('保存エラー', e.message)
    }
  }

  return (
    <FlatList
      data={records}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>売上管理（Daily Record）</Text>

          <RecordInputForm
            onSave={handleSave}
            month={month}
            onChangeMonth={setMonth}
            onExportCsv={async () => {
              try {
                await exportMonthlyCsv(month)
                Alert.alert('CSV出力完了')
              } catch {
                Alert.alert('CSV出力エラー')
              }
            }}
          />
        </View>
      }
      renderItem={({ item }) => <DailyRecordList record={item} />}
    />
  )
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
})
