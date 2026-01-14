// src/hooks/useActionCard.ts
import { useEffect, useState } from 'react';
import { getTodayActionCard, TodayActionCard } from '../utils/getTodayActionCard';

export const useActionCard = () => {
  const [card, setCard] = useState<TodayActionCard | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getTodayActionCard({
        baseDate: '2026-01-14',
        standardCycle: ['DUTY', 'AKEY', 'DUTY', 'AKEY', 'OFF'],
      });

      setCard(result);
    })();
  }, []);

  return card;
};
