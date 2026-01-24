import { useEffect, useState } from 'react';

/*
  ActionCard 用の最小・安全フック

  ・baseDate が未定義でも落ちない
  ・まだ ActionCard を使わなくても問題なし
  ・思想（非評価・非強制）を壊さない
*/

type ActionCardState = {
  baseDate: string | null;
  message: string | null;
  status: 'idle' | 'ready';
};

export const useActionCard = () => {
  const [state, setState] = useState<ActionCardState>({
    baseDate: null,
    message: null,
    status: 'idle',
  });

  useEffect(() => {
    // ここでは「何もしない」が正解
    // ActionCard は Phase2.5 以降で本実装予定

    setState({
      baseDate: null,
      message: null,
      status: 'idle',
    });
  }, []);

  return {
    baseDate: state.baseDate,
    message: state.message,
    status: state.status,
  };
};
