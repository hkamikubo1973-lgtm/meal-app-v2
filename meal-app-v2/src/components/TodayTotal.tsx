import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';

type BusinessTotal = {
  business_type: 'normal' | 'charter' | 'other';
  total_sales: number;
};

type Props = {
  dutyDate: string;
  total: number;
  businessTotals: BusinessTotal[];
};

const label = (type: 'normal' | 'charter' | 'other') => {
  switch (type) {
    case 'normal':
      return '通常';
    case 'charter':
      return '貸切';
    case 'other':
      return 'その他';
    default:
      return '';
  }
};

const color = (type: 'normal' | 'charter' | 'other') => {
  switch (type) {
    case 'normal':
      return '#bbdefb';
    case 'charter':
      return '#ffcdd2';
    case 'other':
      return '#e1bee7';
    default:
      return '#fff';
  }
};

export default function TodayTotal({
  dutyDate,
  total,
  businessTotals,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      style={{
        padding: 18,
        backgroundColor: '#1e88e5',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text style={{ fontSize: 13, color: '#e3f2fd' }}>
        本日の売上（出庫日基準）
      </Text>

      <Text
        style={{
          fontSize: 34,
          fontWeight: 'bold',
          color: '#fff',
          marginTop: 6,
        }}
      >
        {total.toLocaleString()} 円
      </Text>

      {/* 折りたたみ部 */}
      {open && (
        <View style={{ marginTop: 6 }}>
          {businessTotals.map((b) => (
            <Text
              key={b.business_type}
              style={{
                fontSize: 14,
                color: color(b.business_type),
                marginTop: 2,
              }}
            >
              {label(b.business_type)}：
              {b.total_sales.toLocaleString()} 円
            </Text>
          ))}
        </View>
      )}

      <Text
        style={{
          fontSize: 12,
          color: '#bbdefb',
          marginTop: 6,
        }}
      >
        乗務日：{dutyDate}（タップで{open ? '閉じる' : '展開'}）
      </Text>
    </Pressable>
  );
}
