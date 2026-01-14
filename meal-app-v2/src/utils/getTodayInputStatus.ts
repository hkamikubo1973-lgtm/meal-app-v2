// src/utils/getTodayInputStatus.ts
import { getDb } from '../database/database';

export interface TodayInputStatus {
  hasSalesRecord: boolean;
  hasMealRecord: boolean;   // Phase1: false 固定
  hasHealthRecord: boolean; // Phase1: false 固定
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export const getTodayInputStatus = async (): Promise<TodayInputStatus> => {
  const db = await getDb();
  const date = todayKey();

  const rows = await db.getAllAsync<{ cnt: number }>(`
    SELECT COUNT(*) as cnt
    FROM records
    WHERE date = ?
  `, [date]);

  return {
    hasSalesRecord: (rows[0]?.cnt ?? 0) > 0,
    hasMealRecord: false,
    hasHealthRecord: false,
  };
};
