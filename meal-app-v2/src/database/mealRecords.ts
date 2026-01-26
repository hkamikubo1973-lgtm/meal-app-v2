import { getDb } from './database';

export type MealRecord = {
  id: number;
  uuid: string;
  duty_date: string;
  meal_label: string;
  meal_time: string;
  created_at: string;
};

/* =========
   INSERT
========= */

export const insertMealRecord = async (
  uuid: string,
  dutyDate: string,
  mealLabel: string
) => {
  const db = await getDb();
  const now = new Date().toISOString();

  console.log('MEAL SAVE TRY', { uuid, dutyDate, mealLabel });

  await db.runAsync(
    `
    INSERT INTO meal_records (
      uuid,
      duty_date,
      meal_label,
      meal_time,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [uuid, dutyDate, mealLabel, now, now]
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

  return await db.getAllAsync<MealRecord>(
    `
    SELECT *
    FROM meal_records
    WHERE uuid = ? AND duty_date = ?
    ORDER BY created_at DESC
    `,
    [uuid, dutyDate]
  );
};
