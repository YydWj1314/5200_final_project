'use client';

import { Bank } from '@/types/Banks';
import { Card, Typography } from 'antd';
import Link from 'next/link';

export default function TopicCard({
  topic, // groupKey
  banks,
}: {
  topic: string;
  banks: Bank[];
}) {
  return (
    <Card
      hoverable
      title={topic}
      style={{ width: '100%', minWidth: 360, maxWidth: 480 }}
    >
      {banks.length ? (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {banks.map((b) => (
            <li key={b.id} title={b.title}>
              {/* TODO */}
              <Link href={`/exams/${b.id}`}>{b.title || 'No title'}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ color: '#999' }}>暂无题目</div>
      )}
    </Card>
  );
}
