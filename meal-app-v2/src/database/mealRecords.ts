// src/database/mealRecords.ts
import { getDb } from './database';
import { normalizeDutyDate } from '../utils/normalizeDutyDate';
import { MealLabel } from '../types/MealLabel';

/* =========================================
   既存：食事レコード取得
========================================= */
export const getMealRecordsByDutyDate = async (
  uuid: string,
  dutyDate: string
) => {
  const db = await getDb();
  const date = normalizeDutyDate(dutyDate);

  return await db.getAllAsync(
    `
    SELECT *
    FROM meal_records
    WHERE uuid = ? AND duty_date = ?
    ORDER BY created_at ASC
    `,
    [uuid, date]
  );
};

/* =========================================
   既存：食事レコード保存
   （Phase2安定版）
========================================= */
export const insertMealRecord = async (
  uuid: string,
  dutyDate: string,
  mealLabel: MealLabel
) => {
  const db = await getDb();
  const date = normalizeDutyDate(dutyDate);
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
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
      [uuid, date, mealLabel, now]
    );
  });
};

/* =========================================
   🆕 Phase2.5：日次メモテーブル初期化
========================================= */
export const ensureDailyMealMemoTable = async () => {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_meal_memo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL,
      duty_date TEXT NOT NULL,
      breakfast_memo TEXT,
      lunch_memo TEXT,
      dinner_memo TEXT,
      snack_memo TEXT,
      updated_at TEXT NOT NULL
    );
  `);
};

/* =========================================
   🆕 日次メモ取得
========================================= */
export const getDailyMealMemo = async (
  uuid: string,
  dutyDate: string
) => {
  const db = await getDb();
  const date = normalizeDutyDate(dutyDate);

  return await db.getFirstAsync(
    `
    SELECT *
    FROM daily_meal_memo
    WHERE uuid = ? AND duty_date = ?
    `,
    [uuid, date]
  );
};

/* =========================================
   🆕 日次メモ保存（upsert）
========================================= */
export const upsertDailyMealMemo = async (
  uuid: string,
  dutyDate: string,
  memoMap: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snack?: string;
  }
) => {
  const db = await getDb();
  const date = normalizeDutyDate(dutyDate);
  const now = new Date().toISOString();

  const existing = await db.getFirstAsync(
    `
    SELECT id
    FROM daily_meal_memo
    WHERE uuid = ? AND duty_date = ?
    `,
    [uuid, date]
  );

  if (existing) {
    await db.runAsync(
      `
      UPDATE daily_meal_memo
      SET breakfast_memo = ?,
          lunch_memo = ?,
          dinner_memo = ?,
          snack_memo = ?,
          updated_at = ?
      WHERE uuid = ? AND duty_date = ?
      `,
      [
        memoMap.breakfast || '',
        memoMap.lunch || '',
        memoMap.dinner || '',
        memoMap.snack || '',
        now,
        uuid,
        date,
      ]
    );
  } else {
    await db.runAsync(
      `
      INSERT INTO daily_meal_memo (
        uuid,
        duty_date,
        breakfast_memo,
        lunch_memo,
        dinner_memo,
        snack_memo,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        uuid,
        date,
        memoMap.breakfast || '',
        memoMap.lunch || '',
        memoMap.dinner || '',
        memoMap.snack || '',
        now,
      ]
    );
  }
};