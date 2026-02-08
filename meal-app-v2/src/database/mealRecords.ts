// src/database/mealRecords.ts
import { getDb } from './database';
import { normalizeDutyDate } from '../utils/normalizeDutyDate';
import { MealLabel } from '../types/MealLabel';

/* =====================
   食事レコード取得
===================== */
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

/* =====================
   食事レコード保存
   （Phase2安定版）
===================== */
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
