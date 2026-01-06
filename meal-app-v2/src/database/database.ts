import * as SQLite from 'expo-sqlite';

/**
 * DBインスタンス（シングルトン）
 */
let db: SQLite.SQLiteDatabase | null = null;

/**
 * DailyRecord 型
 */
export interface DailyRecord {
  id?: number;
  date: string;                 // YYYY-MM-DD
  sales: number | null;
  health_score: number | null;
  memo: string | null;
}

/**
 * DB取得（未初期化ならエラー）
 */
const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

/**
 * DB初期化 & テーブル作成
 */
export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('meal.db');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS shifts_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        type_id INTEGER NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_records_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        sales INTEGER,
        health_score INTEGER,
        memo TEXT
      );
    `);

    console.log('✅ DB initialized');
  } catch (error) {
    console.error('❌ DB init error', error);
    throw error;
  }
};

/**
 * 日次レコード INSERT
 */
export const insertDailyRecord = async (
  record: Omit<DailyRecord, 'id'>
): Promise<void> => {
  const database = getDb();

  await database.runAsync(
    `INSERT INTO daily_records_table (date, sales, health_score, memo)
     VALUES (?, ?, ?, ?)`,
    record.date,
    record.sales,
    record.health_score,
    record.memo
  );
};

/**
 * 日次レコード 全件取得
 */
export const getAllDailyRecords = async (): Promise<DailyRecord[]> => {
  const database = getDb();

  const rows = await database.getAllAsync<DailyRecord>(
    `SELECT * FROM daily_records_table ORDER BY date DESC`
  );

  return rows;
};
