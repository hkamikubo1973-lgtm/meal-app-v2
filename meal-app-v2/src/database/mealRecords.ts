import { getDb } from './database';

export async function insertMealRecord(
  uuid: string,
  dutyDate: string,
  label: string
) {
  const db = await getDb();
  const mealTime = new Date().toISOString();

  await db.runAsync(
    `
    INSERT INTO meal_records (uuid, duty_date, meal_time, label)
    VALUES (?, ?, ?, ?)
    `,
    [uuid, dutyDate, mealTime, label]
  );
}

export async function getMealRecordsByDate(
  uuid: string,
  dutyDate: string
) {
  const db = await getDb();

  const rows = await db.getAllAsync(
    `
    SELECT *
    FROM meal_records
    WHERE uuid = ? AND duty_date = ?
    ORDER BY meal_time ASC
    `,
    [uuid, dutyDate]
  );

  return rows ?? [];
}
