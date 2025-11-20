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

      {/* 答案区：按需改样式/是否折叠 */}
      <div style={{ marginTop: 12 }}>
        <Paragraph
          ellipsis={{ rows: 2, expandable: false }} // 最多两行，超出省略
          style={{ marginBottom: 0 }}
        >
          {question.answer ?? '（暂无）'}
        </Paragraph>
      </div>

      {/* 右下角收藏按钮 */}
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
