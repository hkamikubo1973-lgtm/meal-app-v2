// src/utils/getTodayDuty.ts

export type DutyType = 'DUTY' | 'AKEY' | 'OFF';

export const getTodayDuty = (params: {
  baseDate: string;
  standardCycle: DutyType[];
  targetDate?: string;
}): DutyType => {
  const { baseDate, standardCycle, targetDate } = params;

  const base = new Date(baseDate);
  const today = targetDate ? new Date(targetDate) : new Date();

  const diffDays = Math.floor(
    (today.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)
  );

  const index =
    ((diffDays % standardCycle.length) + standardCycle.length) %
    standardCycle.length;

  return standardCycle[index];
};
