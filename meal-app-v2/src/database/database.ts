import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/* =========
   型定義（売上のみ）
========= */

export type DailyRecord = {
  id: number;
  uuid: string;
  duty_date: string;
  sales: number;
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

/* =========
   DB取得 & 初期化
========= */

export const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');

    // 売上テーブル（最小・確実構成）
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        duty_date TEXT NOT NULL,
        sales INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    console.log('DB INIT OK');
  }
  return db;
};

/* =========
   INSERT（売上）
========= */

export const insertDailyRecord = async (
  uuid: string,
  dutyDate: string,
  sales: number
) => {
  const db = await getDb();

  console.log('SAVE BUTTON PRESSED', { uuid, dutyDate, value: sales });

  await db.runAsync(
    `
    INSERT INTO daily_records (
      uuid,
      duty_date,
      sales,
      created_at
    )
    VALUES (?, ?, ?, ?)
    `,
    [uuid, dutyDate, sales, new Date().toISOString()]
  );
};

/* =========
   SELECT（売上）
========= */

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

export const getTodayBusinessTotals = async (
  uuid: string,
  dutyDate: string
) => {
  const db = await getDb();

  return await db.getAllAsync(
    `
    SELECT
      business_type,
      SUM(sales) as total_sales
    FROM daily_records
    WHERE uuid = ?
      AND duty_date = ?
    GROUP BY business_type
    `,
    [uuid, dutyDate]
  );
};

// src/database/database.ts

export const getTodaySalesRecords = async (
  uuid: string,
  dutyDate: string
) => {
  const db = await getDb();

  return await db.getAllAsync(
    `
    SELECT
      id,
      sales,
      created_at
    FROM daily_records
    WHERE uuid = ?
      AND duty_date = ?
    ORDER BY created_at ASC
    `,
    [uuid, dutyDate]
  );
};
