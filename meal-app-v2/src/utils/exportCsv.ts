import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDb } from '../database/database';

const escapeCsv = (value: any) => {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportRecordsCsv = async () => {
  const db = await getDb();

  const rows = await db.getAllAsync<{
    date: string;
    type: string;
    sales: number;
    health_score: number | null;
    memo: string | null;
  }>(`
    SELECT date, type, sales, health_score, memo
    FROM records
    ORDER BY date ASC, id ASC
  `);

  const header = ['date', 'type', 'sales', 'health_score', 'memo'];

  const csvLines = [
    header.join(','),
    ...rows.map((r) =>
      [
        escapeCsv(r.date),
        escapeCsv(r.type),
        escapeCsv(r.sales),
        escapeCsv(r.health_score),
        escapeCsv(r.memo),
      ].join(',')
    ),
  ];

  const csv = csvLines.join('\n');
  const fileUri = FileSystem.documentDirectory + 'records.csv';

  await FileSystem.writeAsStringAsync(fileUri, csv);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'CSVを共有',
    });
  } else {
    alert('共有機能が利用できません');
  }
};
