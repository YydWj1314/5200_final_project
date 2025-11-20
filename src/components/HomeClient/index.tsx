'use client';
import { List } from 'antd';
import { Bank } from '@/types/Banks';
import TopicCard from '../TopicCard/HomeTopicCard';

interface BankGroups {
  [groupKey: string]: Bank[];
}

export default function HomeClient({ items }: { items: BankGroups }) {
  /**
   *   [ "key",
          [
            { id: 1, title: "..." },
            { id: 2, title: "..." }
          ]
       ], [groupKey, banks],
   */
  const groups = Object.entries(items);

  return (
    <List
      grid={{ gutter: 36, xs: 1, sm: 1, md: 1, lg: 2 }}
      style={{
        maxWidth: 1188,
        margin: '0 auto',
        paddingInline: 18,
      }}
      dataSource={groups}
      rowKey={([groupKey]) => groupKey}
      renderItem={([groupKey, banks]) => {
        return (
          <List.Item style={{ display: 'flex', justifyContent: 'center' }}>
            <TopicCard topic={groupKey} banks={banks} />
          </List.Item>
        );
      }}
    />
  );
}
