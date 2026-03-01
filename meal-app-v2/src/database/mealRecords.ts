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
   食事レコード保存（安全重複防止のみ）
========================================= */
export const insertMealRecord = async (
  uuid: string,
  dutyDate: string,
  mealLabel: MealLabel
) => {
  const db = await getDb();
  const date = normalizeDutyDate(dutyDate);

  const nowDate = new Date();
  const now = nowDate.toISOString();

  /* =========================================
     ① 直前1件取得（同一日の最新）
  ========================================= */
  const last = await db.getFirstAsync<{
    id: number;
    meal_label: string;
    created_at: string;
  }>(
    `
    SELECT *
    FROM meal_records
    WHERE uuid = ? AND duty_date = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [uuid, date]
  );

  /* =========================================
     ② 5秒以内の同一ラベルなら保存しない
  ========================================= */
  if (last) {
    const lastTime = new Date(last.created_at).getTime();
    const diffSeconds =
      (nowDate.getTime() - lastTime) / 1000;

    if (
      last.meal_label === mealLabel &&
      diffSeconds <= 5
    ) {
      console.log('⛔ 重複防止：5秒以内の同一ラベル');
      return;
    }
  }

  /* =========================================
     ③ 通常保存
  ========================================= */
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
   食事レコード削除（安全）
========================================= */
export const deleteMealRecord = async (id: number) => {
  const db = await getDb();

  await db.runAsync(
    `
    DELETE FROM meal_records
    WHERE id = ?
    `,
    [id]
  );
};

/* =========================================
   Phase2.5：日次メモテーブル初期化
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
   日次メモ取得
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
   日次メモ保存（upsert）
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