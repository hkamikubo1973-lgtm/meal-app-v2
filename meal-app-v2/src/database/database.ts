import * as SQLite from 'expo-sqlite'
import { DailyRecord } from '../types/DailyRecord'

const db = SQLite.openDatabase('records.db')

export const initDatabase = async () => {
  db.transaction((tx) => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        sales INTEGER NOT NULL,
        healthScore INTEGER NOT NULL,
        memo TEXT
      );
    `)
  })
}

export const addRecord = (record: Omit<DailyRecord, 'id'>) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO records (date, sales, healthScore, memo) VALUES (?, ?, ?, ?)`,
        [record.date, record.sales, record.healthScore, record.memo ?? null],
        () => resolve(),
        (_, err) => {
          reject(err)
          return false
        }
      )
    })
  })
}

export const getAllRecords = (): Promise<DailyRecord[]> => {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM records ORDER BY date DESC`,
        [],
        (_, { rows }) => resolve(rows._array as DailyRecord[])
      )
    })
  })
}
