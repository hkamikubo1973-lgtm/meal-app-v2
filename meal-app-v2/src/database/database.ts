/**
 * ============================================
 * ⚠ Phase2 安定固定領域（Technical Master Ver.T2）
 * --------------------------------------------
 * 変更禁止：
 * - duty_date ロジック
 * - daily_records 構造
 * - meal_records 構造
 *
 * 追加のみ許可。
 * ============================================
 */

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    /* --- 🆕 乗務サイクルテーブル（追加のみ） --- */
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS duty_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        duty_date TEXT NOT NULL,
        duty_type TEXT NOT NULL,   -- 'work' | 'after' | 'off'
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

export type DutyType = 'work' | 'after' | 'off'; // 🆕

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
   duty_date 正規化
========= */

const normalizeDutyDate = (dutyDate: string) =>
  dutyDate.slice(0, 10);

/* =========
   売上 INSERT
========= */

export const insertDailyRecord = async (
  uuid: string,
  dutyDate: string,
  sales: number,
  businessType: BusinessType = 'normal'
) => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

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
      businessType,
      null,
      new Date().toISOString(),
    ]
  );
};

/* =========
   本日合計
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
   今月合計（締日対応）
========= */

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getMonthlyTotalSales = async (
  uuid: string,
  dutyDate: string,
  closingDay: number
): Promise<number> => {

  const db = await getDb();

  const current = new Date(dutyDate);
  const year = current.getFullYear();
  const month = current.getMonth();
  const day = current.getDate();

  let start: Date;
  let end: Date;

  if (day > closingDay) {
    start = new Date(year, month, closingDay + 1);
    end = new Date(year, month + 1, closingDay);
  } else {
    start = new Date(year, month - 1, closingDay + 1);
    end = new Date(year, month, closingDay);
  }

  // 🔒 安全フォーマット使用（ISO禁止）
  const startStr = formatDate(start);
  const endStr = formatDate(end);

  const rows = await db.getAllAsync<{ total: number }>(
    `
    SELECT COALESCE(SUM(sales), 0) AS total
    FROM daily_records
    WHERE uuid = ?
      AND duty_date BETWEEN ? AND ?
    `,
    [uuid, startStr, endStr]
  );

  return rows[0]?.total ?? 0;
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

  await db.runAsync(
    `
    DELETE FROM daily_records
    WHERE uuid = ? AND duty_date = ?
    `,
    [uuid, dateOnly]
  );
};

export const getDailySalesSummaryByDutyDate = async (
  uuid: string,
  dutyDate: string
) => {
  const db = await getDb();

  const rows: any[] = await db.getAllAsync(
    `
    SELECT business_type, SUM(sales) as total
    FROM daily_records
    WHERE uuid = ?
      AND duty_date = ?
    GROUP BY business_type
    `,
    [uuid, dutyDate]
  );

  const result = {
    normal: 0,
    charter: 0,
    other: 0,
  };

  rows.forEach(r => {
    if (r.business_type in result) {
      result[r.business_type as keyof typeof result] = r.total ?? 0;
    }
  });

  return result;
};
export const getTodayWeather = async (
  uuid: string,
  dutyDate: string
) => {
  const db = await getDb();

  const row: any = await db.getFirstAsync(
    `
    SELECT weather
    FROM daily_records
    WHERE uuid = ?
      AND duty_date = ?
    LIMIT 1
    `,
    [uuid, dutyDate]
  );

  return row?.weather ?? null;
};

export const updateWeatherByDutyDate = async (
  uuid: string,
  dutyDate: string,
  weather: string
) => {
  const db = await getDb();

  await db.runAsync(
    `
    UPDATE daily_records
    SET weather = ?
    WHERE uuid = ?
      AND duty_date = ?
    `,
    [weather, uuid, dutyDate]
  );
};
