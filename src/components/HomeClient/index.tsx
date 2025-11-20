'use client';
import { List, Card } from 'antd';
import Link from 'next/link';
import { Bank } from '@/types/Banks';
import TopicCard from '../TopicCard/HomeTopicCard';
import styles from './Banner.module.css';
import Banner from '../Banner';

interface BankGroups {
  [groupKey: string]: Bank[];
}

export default function HomeClient({ items }: { items: BankGroups }) {
  // 把 { [groupKey]: Bank[]...} 转成数组 [[groupKey, banks] ...]，便于 List 渲染
  /**
   *   [ "key",
          [
            { id: 1, title: "算法与数据结构" },
            { id: 2, title: "操作系统" }
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
        paddingInline: 18, //  gutter/2，兜住 .ant-row 的负外边距
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
