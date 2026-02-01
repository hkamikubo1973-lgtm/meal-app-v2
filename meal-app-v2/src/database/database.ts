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

  // ★ 保険：undefined 完全排除
  const safeBusinessType: BusinessType =
    businessType === 'charter' || businessType === 'other'
      ? businessType
      : 'normal';

  await db.runAsync(
    `
    INSERT INTO daily_records (
      uuid,
      duty_date,
      sales,
      business_type,
      weather,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      uuid,
      dateOnly,
      sales,
      safeBusinessType,
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
  label: MealLabel,
  memo: string | null = null
) => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  await db.runAsync(
    `
    INSERT INTO meal_records (
      uuid,
      duty_date,
      meal_label,
      memo,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [uuid, dateOnly, label, memo, new Date().toISOString()]
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

  const rows = await db.getAllAsync<{
    business_type: BusinessType;
    amount: number;
  }>(
    `
    SELECT business_type, SUM(sales) as amount
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

  rows.forEach(r => {
    summary.total += r.amount;
    summary[r.business_type] = r.amount;
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
    WHERE uuid = ? AND duty_date LIKE ?
    `,
    [uuid, month]
  );

  return rows[0]?.total ?? 0;
};

export const getTodayTimeline = async (
  uuid: string,
  dutyDate: string
) => {
  const db = await getDb();
  const dateOnly = dutyDate.slice(0, 10);

  const sales = await db.getAllAsync<any>(
    `
    SELECT
      id,
      created_at,
      sales as amount,
      business_type
    FROM daily_records
    WHERE uuid = ? AND duty_date = ?
    `,
    [uuid, dateOnly]
  );

  const meals = await db.getAllAsync<any>(
    `
    SELECT
      id,
      created_at,
      meal_label,
      memo
    FROM meal_records
    WHERE uuid = ? AND duty_date = ?
    `,
    [uuid, dateOnly]
  );

  const timeline = [
    ...sales.map(s => ({
      type: 'sale' as const,
      id: s.id,
      time: s.created_at,
      amount: s.amount,
      businessType: s.business_type,
    })),
    ...meals.map(m => ({
      type: 'meal' as const,
      id: m.id,
      time: m.created_at,
      label: m.meal_label,
      memo: m.memo,
    })),
  ];

  timeline.sort((a, b) =>
    a.time < b.time ? 1 : -1
  );

  return timeline;
};

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
