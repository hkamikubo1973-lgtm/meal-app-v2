// src/constants/actionCardMessages.ts
import { ActionCardType } from '../types/actionCard';

export const ACTION_CARD_MESSAGES: Record<ActionCardType, string[]> = {
  MEAL_PENDING: [
    '今日はここまででOK。あとで振り返れるように、写真を1枚残しておく？',
  ],

  SALES_PENDING: [
    '今日の売上、メモだけ残す？',
    '数字だけでも残しとこ。',
  ],

  HEALTH_CHECK: [
    '今日は明け。体調どう？',
    '無理しない日。調子だけ教えて。',
  ],

  NEXT_DUTY_INFO: [
    '次の出番、確認しとく？',
    '次はいつだっけ？',
  ],

  NONE: [],
};
