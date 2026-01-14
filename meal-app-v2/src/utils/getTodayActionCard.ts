// src/utils/getTodayActionCard.ts
import { getTodayInputStatus } from './getTodayInputStatus';
import { getActionCardType } from './getActionCard';
import { pickActionCardMessage } from './pickActionCardMessage';
import { DutyConfig } from '../types/dutyModel';
import { getTodayDuty } from './getTodayDuty';

export interface TodayActionCard {
  type: string;
  message: string | null;
}

export const getTodayActionCard = async (
  dutyConfig: DutyConfig
): Promise<TodayActionCard> => {
  const duty = getTodayDuty(dutyConfig);
  const status = await getTodayInputStatus();

  const type = getActionCardType({
    duty,
    hasSalesRecord: status.hasSalesRecord,
    hasMealRecord: status.hasMealRecord,
    hasHealthRecord: status.hasHealthRecord,
  });

  const message = pickActionCardMessage(type);

  return { type, message };
};
