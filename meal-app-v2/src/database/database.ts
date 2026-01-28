// src/database/database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/* =========
   型定義
========= */

export type BusinessType = 'normal' | 'charter' | 'other';

export type WeatherType =
  | '晴'
  | '曇'
  | '雨'
  | '雪'
  | '荒天';

export type DailyRecord = {
  id: number;
  uuid: string;
  duty_date: string;
  sales: number;
  business_type: BusinessType;
  weather?: WeatherType | null;
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
  created_at: string;
};

/* =========
   DB取得 & 初期化
========= */

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
        business_type TEXT NOT NULL DEFAULT 'normal',
        weather TEXT,
        created_at TEXT NOT NULL
      );
    `);

    /* --- weather列が無い旧DB対応 --- */
    const columns: { name: string }[] = await db.getAllAsync(
      `PRAGMA table_info(daily_records);`
    );

    if (!columns.some(c => c.name === 'weather')) {
      await db.execAsync(
        `ALTER TABLE daily_records ADD COLUMN weather TEXT;`
      );
      console.log('weather column added');
    }

    /* --- 食事テーブル --- */
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

  await db.runAsync(
    `
    INSERT INTO daily_records (
      uuid,
      duty_date,
      sales,
      business_type,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [uuid, dateOnly, sales, businessType, new Date().toISOString()]
  );
};

/* =========
   天気：UPDATE（当日）
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
   天気：保存（UI用ラッパー）
========= */

export const saveWeather = async (
  uuid: string,
  dutyDate: string,
  weather: WeatherType
) => {
  await updateWeatherByDutyDate(uuid, dutyDate, weather);
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
   売上：当日リセット（全削除）
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

  console.log('DAILY SALES RESET', dateOnly);
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
    INSERT INTO meal_records (
      uuid,
      duty_date,
      meal_label,
      created_at
    )
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
   売上：種別サマリー
========= */

export type DailySalesSummary = {
  total: number;
  normal: number;
  charter: number;
  other: number;
};

export const getDailySalesSummaryByDutyDate = async (
  uuid: string,
  dutyDate: string
): Promise<DailySalesSummary> => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  const rows: {
    business_type: string;
    amount: number;
  }[] = await db.getAllAsync(
    `
    SELECT
      business_type,
      SUM(sales) as amount
    FROM daily_records
    WHERE uuid = ? AND duty_date = ?
    GROUP BY business_type
    `,
    [uuid, dateOnly]
  );

  const summary: DailySalesSummary = {
    total: 0,
    normal: 0,
    charter: 0,
    other: 0,
  };

  rows.forEach(row => {
    const amount = row.amount ?? 0;
    summary.total += amount;

    if (row.business_type === 'normal') summary.normal = amount;
    if (row.business_type === 'charter') summary.charter = amount;
    if (row.business_type === 'other') summary.other = amount;
  });

  return summary;
};

/* =========
   天気：当日取得
========= */

export const getTodayWeather = async (
  uuid: string,
  dutyDate: string
): Promise<WeatherType | null> => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  const rows = await db.getAllAsync<{ weather: string | null }>(
    `
    SELECT weather
    FROM daily_records
    WHERE uuid = ? AND duty_date = ?
      AND weather IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [uuid, dateOnly]
  );

  return (rows[0]?.weather as WeatherType) ?? null;
};

/* =========
   今月合計
========= */

export const getMonthlyTotalSales = async (
  uuid: string,
  dutyDate: string
): Promise<number> => {
  const db = await getDb();
  const month = dutyDate.slice(0, 7) + '%';

  const rows = await db.getAllAsync<{ total: number }>(
    `
    SELECT COALESCE(SUM(sales), 0) AS total
    FROM daily_records
    WHERE uuid = ?
      AND duty_date LIKE ?
    `,
    [uuid, month]
  );

  return rows[0]?.total ?? 0;
};
