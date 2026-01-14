// src/constants/actionCardMessages.ts

import { ActionCardType } from '../types/actionCard';

export const ACTION_CARD_MESSAGES: Record<ActionCardType, string[]> = {
  SALES_PENDING: [
    '今日の売上、メモだけ残す？',
    'まだなら、サクッと入力しとく？',
  ],

  MEAL_PENDING: [
    '食事、写真だけ残しとく？',
    'あとで見る用に1枚いっとく？',
  ],

  HEALTH_CHECK: [
    '体調どう？ひとことだけでも。',
    '今日は無理しないでOK。',
  ],

  NEXT_DUTY: [
    '次の出番、軽く確認しとく？',
    '明日の流れ、見ておく？',
  ],
};
