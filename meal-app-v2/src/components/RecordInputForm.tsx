import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'

type Props = {
  onSave: (sales: number, healthScore: number, memo?: string) => void
  month: string
  onChangeMonth: (month: string) => void
  onExportCsv: () => void
}

export default function RecordInputForm({
  onSave,
  month,
  onChangeMonth,
  onExportCsv,
}: Props) {
  const [sales, setSales] = useState('')
  const [healthScore, setHealthScore] = useState<number | null>(null)
  const [memo, setMemo] = useState('')

  const handleSave = () => {
    if (healthScore === null) {
      // ★ ここで必ず弾く（App.tsxに undefined を渡さない）
      return
    }

    onSave(
      Number(sales || 0),
      healthScore,
      memo.trim() || undefined
    )

    // 入力リセット
    setSales('')
    setHealthScore(null)
    setMemo('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>売上</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="例: 12000"
        value={sales}
        onChangeText={setSales}
      />

      <Text style={styles.label}>健康スコア</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((v) => (
          <TouchableOpacity
            key={v}
            style={[
              styles.starButton,
              healthScore === v && styles.starSelected,
            ]}
            onPress={() => setHealthScore(v)}
          >
            <Text>★{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>メモ</Text>
      <TextInput
        style={styles.memo}
        multiline
        value={memo}
        onChangeText={setMemo}
        placeholder="自由記入"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>保存</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.csvButton} onPress={onExportCsv}>
        <Text style={styles.csvText}>CSV出力（今月）</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  memo: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    height: 80,
    textAlignVertical: 'top',
  },
  starRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  starButton: {
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  starSelected: {
    backgroundColor: '#ddd',
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 6,
  },
  saveText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  csvButton: {
    marginTop: 12,
    backgroundColor: '#555',
    padding: 12,
    borderRadius: 6,
  },
  csvText: {
    color: '#fff',
    textAlign: 'center',
  },
})
