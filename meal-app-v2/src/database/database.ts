import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');

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
}

/* ★★ これが無い or export されていなかった ★★ */
export async function insertDailyRecord(
  uuid: string,
  dutyDate: string,
  sales: number
) {
  console.log('insertDailyRecord CALLED', { uuid, dutyDate, sales });

  const db = await getDb();

  await db.runAsync(
    `
    INSERT INTO daily_records (uuid, duty_date, sales, created_at)
    VALUES (?, ?, ?, ?)
    `,
    [uuid, dutyDate, sales, new Date().toISOString()]
  );
}
