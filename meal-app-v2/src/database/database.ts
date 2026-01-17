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
  business_type: 'normal' | 'charter' | 'other';
  created_at: string;
};

export type DailyTotal = {
  duty_date: string;
  total_sales: number;
};

export type MonthlyTotal = {
  month: string; // YYYY-MM
  total_sales: number;
};

export type MonthlyBusinessTotal = {
  month: string; // YYYY-MM
  business_type: 'normal' | 'charter' | 'other';
  total_sales: number;
};

export type DailyBusinessTotal = {
  duty_date: string;
  business_type: 'normal' | 'charter' | 'other';
  total_sales: number;
};

/* =========
   DB取得 & 初期化
========= */

export const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');

    // ---- 売上（既存・聖域） ----
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        duty_date TEXT NOT NULL,
        sales INTEGER NOT NULL,
        business_type TEXT NOT NULL DEFAULT 'normal',
        created_at TEXT NOT NULL
      );
    `);

    // ---- Phase2: 食事タグ（独立） ----
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        duty_date TEXT NOT NULL,
        meal_label TEXT NOT NULL,
        meal_time TEXT NOT NULL,
        is_synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  return db;
};

/* =========
   INSERT（売上）
========= */

export const insertDailyRecord = async (
  uuid: string,
  dutyDate: string,
  sales: number,
  businessType: 'normal' | 'charter' | 'other'
) => {
  const db = await getDb();

  await db.runAsync(
    `
    INSERT INTO daily_records
      (uuid, duty_date, sales, business_type, created_at)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      uuid,
      dutyDate,
      sales,
      businessType,
      new Date().toISOString(),
    ]
  );
};

/* =========
   DELETE（売上）
========= */

export const deleteDailyRecord = async (id: number) => {
  const db = await getDb();
  await db.runAsync(
    `DELETE FROM daily_records WHERE id = ?`,
    [id]
  );
};

/* =========
   SELECT（売上）
========= */

export const getDailyRecords = async (
  uuid: string
): Promise<DailyRecord[]> => {
  const db = await getDb();

  return await db.getAllAsync<DailyRecord>(
    `
    SELECT *
    FROM daily_records
    WHERE uuid = ?
    ORDER BY duty_date DESC, created_at DESC
    `,
    [uuid]
  );
};

export const getDailyTotals = async (
  uuid: string
): Promise<DailyTotal[]> => {
  const db = await getDb();

  return await db.getAllAsync<DailyTotal>(
    `
    SELECT
      duty_date,
      SUM(sales) AS total_sales
    FROM daily_records
    WHERE uuid = ?
    GROUP BY duty_date
    ORDER BY duty_date DESC
    `,
    [uuid]
  );
};

export const getMonthlyTotals = async (
  uuid: string
): Promise<MonthlyTotal[]> => {
  const db = await getDb();

  return await db.getAllAsync<MonthlyTotal>(
    `
    SELECT
      substr(duty_date, 1, 7) AS month,
      SUM(sales) AS total_sales
    FROM daily_records
    WHERE uuid = ?
    GROUP BY substr(duty_date, 1, 7)
    ORDER BY month DESC
    `,
    [uuid]
  );
};

export const getTodayTotal = async (
  uuid: string,
  dutyDate: string
): Promise<number> => {
  const db = await getDb();

  const rows = await db.getAllAsync<{ total: number }>(
    `
    SELECT COALESCE(SUM(sales), 0) AS total
    FROM daily_records
    WHERE uuid = ? AND duty_date = ?
    `,
    [uuid, dutyDate]
  );

  return rows[0]?.total ?? 0;
};

export const getMonthlyBusinessTotals = async (
  uuid: string
): Promise<MonthlyBusinessTotal[]> => {
  const db = await getDb();

  return await db.getAllAsync<MonthlyBusinessTotal>(
    `
    SELECT
      substr(duty_date, 1, 7) AS month,
      business_type,
      SUM(sales) AS total_sales
    FROM daily_records
    WHERE uuid = ?
    GROUP BY substr(duty_date, 1, 7), business_type
    ORDER BY month DESC, business_type
    `,
    [uuid]
  );
};

export const getDailyBusinessTotals = async (
  uuid: string
): Promise<DailyBusinessTotal[]> => {
  const db = await getDb();

  return await db.getAllAsync<DailyBusinessTotal>(
    `
    SELECT
      duty_date,
      business_type,
      SUM(sales) AS total_sales
    FROM daily_records
    WHERE uuid = ?
    GROUP BY duty_date, business_type
    ORDER BY duty_date DESC, business_type
    `,
    [uuid]
  );
};

export const getTodayBusinessTotals = async (
  uuid: string,
  dutyDate: string
): Promise<
  {
    business_type: 'normal' | 'charter' | 'other';
    total_sales: number;
  }[]
> => {
  const db = await getDb();

  return await db.getAllAsync(
    `
    SELECT
      business_type,
      SUM(sales) AS total_sales
    FROM daily_records
    WHERE uuid = ? AND duty_date = ?
    GROUP BY business_type
    `,
    [uuid, dutyDate]
  );
};

/* =========
   Phase2: 食事タグ（INSERTのみ）
========= */

export const insertMealRecord = async (
  uuid: string,
  dutyDate: string,
  mealLabel:
    | 'noodle'
    | 'rice'
    | 'light'
    | 'healthy'
    | 'supplement'
    | 'skip'
) => {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `
    INSERT INTO meal_records (
      uuid,
      duty_date,
      meal_label,
      meal_time
    )
    VALUES (?, ?, ?, ?)
    `,
    [uuid, dutyDate, mealLabel, now]
  );
};

export const getTodayMealLabel = async (
  uuid: string,
  dutyDate: string
): Promise<string | null> => {
  const db = await getDb();

  const rows = await db.getAllAsync<{ meal_label: string }>(
    `
    SELECT meal_label
    FROM meal_records
    WHERE uuid = ? AND duty_date = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [uuid, dutyDate]
  );

  return rows.length > 0 ? rows[0].meal_label : null;
};
