/**
 * ============================================
 * 🎴 Action Card Messages
 * Ver.3.3.9（非監視・非催促 強化版）
 *
 * 原則：
 * ・命令しない
 * ・催促しない
 * ・25文字前後
 * ・乗務の区切りに寄り添う
 * ============================================
 */

export type ActionCardMessageType =
  | 'default'
  | 'afterDuty'
  | 'rainy';

/**
 * 通常表示
 */
export const defaultMessage =
  '今日もお疲れ様でした。';

/**
 * 乗務終了後（最有力候補）
 */
export const afterDutyMessage =
  '一日お疲れ様でした。今日のご飯を一枚。';

/**
 * 雨天時
 */
export const rainyMessage =
  '雨の中、本当にお疲れ様でした。';

/**
 * メッセージ取得関数
 */
export const getActionCardMessage = (
  type: ActionCardMessageType
): string => {
  switch (type) {
    case 'afterDuty':
      return afterDutyMessage;

    case 'rainy':
      return rainyMessage;

    case 'default':
    default:
      return defaultMessage;
  }
};
