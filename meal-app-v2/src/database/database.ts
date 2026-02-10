// src/database/database.ts
import * as SQLite from 'expo-sqlite';

/* =========
   DB本体（Async版）
========= */

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');

    /* --- 売上テーブル --- */
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        duty_date TEXT NOT NULL,
        sales INTEGER NOT NULL,
        business_type TEXT NOT NULL,
        weather TEXT,
        created_at TEXT NOT NULL
      );
    `);

    /* --- 食事テーブル --- */
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        duty_date TEXT NOT NULL,
        meal_label TEXT NOT NULL,
        memo TEXT,
        created_at TEXT NOT NULL
      );
    `);

    console.log('DB INIT OK (ASYNC)');
  }

  return db;
};

/* =========
   型定義
========= */

export type BusinessType = 'normal' | 'charter' | 'other';
export type WeatherType = '晴' | '曇' | '雨' | '雪' | '荒天';

export type DailyRecord = {
  id: number;
  uuid: string;
  duty_date: string;
  sales: number;
  business_type: BusinessType;
  weather: WeatherType | null;
  created_at: string;
};

export type MealLabel =
  | 'rice'
  | 'noodle'
  | 'light'
  | 'healthy'
  | 'supplement'
  | 'skip';

export type MealRecord = {
  id: number;
  uuid: string;
  duty_date: string;
  meal_label: MealLabel;
  memo: string | null;
  created_at: string;
};

/* =========
   共通
========= */

const normalizeDutyDate = (dutyDate: string) =>
  dutyDate.slice(0, 10);

/* =========
   売上：INSERT
========= */

export const insertDailyRecord = async (
  uuid: string,
  dutyDate: string,
  sales: number,
  businessType: BusinessType = 'normal'
) => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  const safeType: BusinessType =
    businessType === 'charter' || businessType === 'other'
      ? businessType
      : 'normal';

  await db.runAsync(
    `
    INSERT INTO daily_records
      (uuid, duty_date, sales, business_type, weather, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      uuid,
      dateOnly,
      sales,
      safeType,
      null,
      new Date().toISOString(),
    ]
  );
};

/* =========
   天気：UPDATE
========= */

export const updateWeatherByDutyDate = async (
  uuid: string,
  dutyDate: string,
  weather: WeatherType
) => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  await db.runAsync(
    `
    UPDATE daily_records
    SET weather = ?
    WHERE uuid = ? AND duty_date = ?
    `,
    [weather, uuid, dateOnly]
  );
};

/* =========
   売上：本日合計
========= */

export const getTodayTotalSales = async (
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
   売上：当日一覧
========= */

export const getTodaySalesRecords = async (
  uuid: string,
  dutyDate: string
): Promise<DailyRecord[]> => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  return db.getAllAsync<DailyRecord>(
    `
    SELECT *
    FROM daily_records
    WHERE uuid = ? AND duty_date = ?
    ORDER BY created_at ASC
    `,
    [uuid, dateOnly]
  );
};

/* =========
   食事：INSERT
========= */

export const insertMealRecord = async (
  uuid: string,
  dutyDate: string,
  label: MealLabel
) => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  await db.runAsync(
    `
    INSERT INTO meal_records
      (uuid, duty_date, meal_label, created_at)
    VALUES (?, ?, ?, ?)
    `,
    [uuid, dateOnly, label, new Date().toISOString()]
  );
};

/* =========
   食事：当日一覧
========= */

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

/* =========
   売上リセット
========= */

export const resetDailySalesByDutyDate = async (
  uuid: string,
  dutyDate: string
) => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  console.log('[RESET] TRY', { uuid, dateOnly });

  await db.runAsync(
    `
    DELETE FROM daily_records
    WHERE uuid = ? AND duty_date = ?
    `,
    [uuid, dateOnly]
  );

  console.log('[RESET] DONE');
};
