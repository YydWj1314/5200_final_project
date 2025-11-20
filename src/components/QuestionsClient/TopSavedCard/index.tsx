'use client';

import { Card, List, Space, Typography } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import type { QuestionInTopSaved } from '@/types/Questions';
import { extractTitle } from '@/libs/utils/extractTitle';

const { Paragraph, Text } = Typography;

export default function TopSavedCard({
  topSaved,
}: {
  topSaved: QuestionInTopSaved[];
}) {
  return (
    <Card title="🔥 Top 10" style={{ marginTop: 24 }}>
      <List
        itemLayout="horizontal"
        dataSource={topSaved}
        rowKey={(q) => q.id}
        renderItem={(q) => (
          <List.Item style={{ paddingInline: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                gap: 12,
              }}
            >
              {/* 左侧标题：单行省略，悬浮显示全文 */}
              <Paragraph
                ellipsis={{ rows: 1, tooltip: q.content }}
                style={{ margin: 0, maxWidth: 560, fontWeight: 500 }}
              >
                <a href={`/questions/${q.id}`}>
                  {extractTitle(q.content ?? '(无标题)')}
                </a>
              </Paragraph>

              {/* 右侧热度 */}
              <Space>
                <FireOutlined style={{ color: '#fa541c' }} />
                <Text strong>{q.saved_count}</Text>
              </Space>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}
