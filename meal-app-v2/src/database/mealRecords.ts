// src/database/mr.ts
import { getDb } from './database';
import type { MealLabel } from './database';

/* =========
   型定義
========= */
export type MealRecord = {
  id: number;
  uuid: string;
  duty_date: string;
  meal_label: MealLabel;
  memo: string | null;
  created_at: string;
};

/* =========
   日付正規化（database.ts と統一）
========= */
const normalizeDutyDate = (dutyDate: string) =>
  dutyDate.slice(0, 10);

/* =========
   INSERT
========= */
export const insertMealRecord = async (
  uuid: string,
  dutyDate: string,
  mealLabel: MealLabel,
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
    [uuid, dateOnly, mealLabel, memo, new Date().toISOString()]
  );
};

/* =========
   SELECT（当日）
========= */
export const getMealRecordsByDutyDate = async (
  uuid: string,
  dutyDate: string
): Promise<MealRecord[]> => {
  const db = await getDb();
  const dateOnly = normalizeDutyDate(dutyDate);

  return await db.getAllAsync<MealRecord>(
    `
    SELECT *
    FROM meal_records
    WHERE uuid = ? AND duty_date = ?
    ORDER BY created_at DESC
    `,
    [uuid, dateOnly]
  );
};
