import { getCycleSettings } from '../database/cycleSettings';
import { DutyType } from '../types/DutyType';

export const getDutyType = async (
  uuid: string,
  targetDate: string
): Promise<DutyType | null> => {

  const settings = await getCycleSettings(uuid);

  if (!settings) return null;
  if (settings.mode !== 'cycle') return null;

  const baseDate = new Date(settings.base_date);
  const date = new Date(targetDate);

  const diffDays = Math.floor(
    (date.getTime() - baseDate.getTime()) /
    (1000 * 60 * 60 * 24)
  );

  const pattern: DutyType[] =
    JSON.parse(settings.pattern_json);

  if (pattern.length === 0) return null;

  const index =
    ((diffDays % pattern.length) +
      pattern.length) %
    pattern.length;

  return pattern[index];
};