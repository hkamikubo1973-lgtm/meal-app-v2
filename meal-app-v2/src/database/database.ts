// src/database/database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/* =========
   型定義
========= */

export type DailyRecord = {
  id: number;
  uuid: string;
  duty_date: string;
  sales: number;
  created_at: string;
};

export type MealRecord = {
  id: number;
  uuid: string;
  duty_date: string;
  meal_label: string;
  created_at: string;
};

/* =========
   DB取得 & 初期化
========= */

export const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');

    // 売上
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        duty_date TEXT NOT NULL,
        sales INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // 食事
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        duty_date TEXT NOT NULL,
        meal_label TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    console.log('DB INIT OK');
  }

  return db;
};

/* =========
   共通：日付正規化
========= */

const normalizeDutyDate = (dutyDate: string) =>
  dutyDate.slice(0, 10);

/* =========
   売上
========= */

export const insertDailyRecord = async (
  uuid: string,
  dutyDate: string,
  sales: number
) => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  await db.runAsync(
    `
    INSERT INTO daily_records (uuid, duty_date, sales, created_at)
    VALUES (?, ?, ?, ?)
    `,
    [uuid, dateOnly, sales, new Date().toISOString()]
  );
};

export const getTodayTotal = async (
  uuid: string,
  dutyDate: string
): Promise<number> => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  const rows = await db.getAllAsync<{ total: number }>(
    `
    SELECT COALESCE(SUM(sales), 0) AS total
    FROM daily_records
    WHERE uuid = ? AND duty_date = ?
    `,
    [uuid, dateOnly]
  );

  return rows[0]?.total ?? 0;
};

/* =========
   食事
========= */

export type MealLabel =
  | 'rice'
  | 'noodle'
  | 'light'
  | 'healthy'
  | 'supplement'
  | 'skip';

export const insertMealRecord = async (
  uuid: string,
  dutyDate: string,
  label: MealLabel
) => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  await db.runAsync(
    `
    INSERT INTO meal_records (uuid, duty_date, meal_label, created_at)
    VALUES (?, ?, ?, ?)
    `,
    [uuid, dateOnly, label, new Date().toISOString()]
  );
};

export const getMealRecordsByDutyDate = async (
  uuid: string,
  dutyDate: string
): Promise<MealRecord[]> => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  return db.getAllAsync<MealRecord>(
    `
    SELECT *
    FROM meal_records
    WHERE uuid = ? AND duty_date = ?
    ORDER BY created_at DESC
    `,
    [uuid, dateOnly]
  );
};
