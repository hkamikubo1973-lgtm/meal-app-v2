import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

export async function exportMonthlyCsv(monthKey: string, csv: string) {
  if (!FileSystem.documentDirectory) {
    throw new Error('Document directory is not available')
  }

  const fileUri =
    FileSystem.documentDirectory + `sales_${monthKey}.csv`

  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  })

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri)
  }
}
