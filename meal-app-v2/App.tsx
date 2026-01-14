// App.tsx
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import RecordInputForm from './src/components/RecordInputForm';
import TodayTotal from './src/components/TodayTotal';
import TodayRecordList from './src/components/TodayRecordList';
import { ActionCard } from './src/components/ActionCard';
import { useActionCard } from './src/hooks/useActionCard';

export default function App() {
  const actionCard = useActionCard();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>

        {/* 🔵 Action Card（条件に合うときだけ1枚表示） */}
        {actionCard && <ActionCard card={actionCard} />}

        {/* 既存UI（順番はそのまま） */}
        <RecordInputForm />
        <TodayTotal />
        <TodayRecordList />

      </ScrollView>
    </SafeAreaView>
  );
}
