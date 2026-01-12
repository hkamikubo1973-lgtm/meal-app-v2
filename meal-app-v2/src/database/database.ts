// src/database/database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * ===== DB VERSION =====
 */
const CURRENT_DB_VERSION = 1;

/**
 * DB取得（Singleton）
 */
export const getDb = async () => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('records.db');
  return db;
};

/**
 * meta テーブルを保証
 */
const ensureMetaTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
};

/**
 * DBバージョン取得
 */
const getDbVersion = async (
  db: SQLite.SQLiteDatabase
): Promise<number | null> => {
  const rows = await db.getAllAsync<{ value: string }>(
    `SELECT value FROM meta WHERE key = 'db_version'`
  );

  if (rows.length === 0) return null;
  return Number(rows[0].value);
};

/**
 * DBバージョン保存
 */
const setDbVersion = async (
  db: SQLite.SQLiteDatabase,
  version: number
) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO meta (key, value)
     VALUES ('db_version', ?)`,
    [String(version)]
  );
};

/**
 * ===== DB初期化（守り仕様）=====
 */
export const initDatabase = async () => {
  const database = await getDb();

  // meta テーブル保証
  await ensureMetaTable(database);

  // 現在のDBバージョン取得
  const currentVersion = await getDbVersion(database);

  // バージョン不一致 → 再構築
  if (currentVersion !== CURRENT_DB_VERSION) {
    console.log(
      `DB version mismatch (${currentVersion} → ${CURRENT_DB_VERSION})`
    );

    // ⚠️ 管理対象テーブルを削除
    await database.execAsync(`
      DROP TABLE IF EXISTS records;
    `);

    // records 再作成
    await database.execAsync(`
      CREATE TABLE records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        sales INTEGER,
        health_score INTEGER,
        memo TEXT,
        type TEXT
      );
    `);

    // DBバージョン保存
    await setDbVersion(database, CURRENT_DB_VERSION);

    console.log('DB recreated');
  } else {
    console.log('DB version OK:', CURRENT_DB_VERSION);
  }
};
