import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { DailyRecord } from '../types/DailyRecord'

type Props = {
  records: DailyRecord[]
}

export default function DailyRecordList({ records }: Props) {
  if (!records || records.length === 0) {
    return null
  }

  const record = records[0]
  if (!record) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{record.date}</Text>
      <Text>¥{record.sales.toLocaleString()}</Text>
      <Text>★{record.healthScore}</Text>
      {record.memo ? <Text>{record.memo}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  date: {
    fontWeight: 'bold',
  },
})
