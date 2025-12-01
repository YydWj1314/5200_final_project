'use client';

import Link from 'next/link';
import { List, Button, Space, Tag } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { useQuestionSaved } from '@/app/hooks/useQuestionSaved';
import type { QuestionInShowList } from '@/types/Questions';
import { extractTitle } from '@/libs/utils/extractTitle';
import { Typography } from 'antd';

const { Paragraph } = Typography;

export default function QuestionListItem({
  question,
}: {
  question: QuestionInShowList;
  tokens?: string[];
}) {
  const { isSaved, isLoading, toggleSave } = useQuestionSaved(
    Number(question.id),
  );

  return (
    <List.Item
      key={question.id}
      style={{ paddingBlock: 40, position: 'relative' }}
    >
      <List.Item.Meta
        title={
          <Link href={`/questions/${question.id}`}>
            {extractTitle(question.content)}
          </Link>
        }
        description={
          Array.isArray(question.tags) ? (
            <Space size={4} wrap>
              {question.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </Space>
          ) : (
            question.tags
          )
        }
      />

      {/* Answer area: modify style/collapse as needed */}
      <div style={{ marginTop: 12 }}>
        <Paragraph
          ellipsis={{ rows: 2, expandable: false }} // Max 2 rows, ellipsis if overflow
          style={{ marginBottom: 0 }}
        >
          {question.answer ?? '(None)'}
        </Paragraph>
      </div>

      {/* Bottom right favorite button */}
      <div style={{ position: 'absolute', bottom: 8, right: 16 }}>
        <Space>
          <Button
            type="text"
            loading={isLoading}
            disabled={isLoading}
            icon={
              isSaved ? (
                <StarFilled style={{ color: '#faad14' }} />
              ) : (
                <StarOutlined />
              )
            }
            onClick={toggleSave}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </Space>
      </div>
    </List.Item>
  );
}
