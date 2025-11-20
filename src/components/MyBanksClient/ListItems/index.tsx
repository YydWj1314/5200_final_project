'use client';

import Link from 'next/link';
import { List, Button, Row, Col, Typography, Tag, Space, Tooltip } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { useQuestionSaved } from '@/app/hooks/useQuestionSaved';
import type { QuestionInShowList } from '@/types/Questions';
import { extractTitle } from '@/libs/utils/extractTitle';

const { Paragraph, Text } = Typography;

export default function MyBankListItem({
  question,
  isEditMode,
}: {
  question: QuestionInShowList;
  isEditMode: boolean;
}) {
  const { isSaved, isLoading, toggleSave } = useQuestionSaved(
    Number(question.id),
  );
  const tags: string[] = Array.isArray(question.tags) ? question.tags : [];

  return (
    <List.Item key={question.id} style={{ paddingBlock: 12 }}>
      <Row
        align="middle"
        justify="space-between"
        wrap={false}
        style={{ width: '100%' }}
      >
        {/* 左侧：标题 + 摘要 + 标签 */}
        <Col flex="auto" style={{ minWidth: 0 }}>
          <Tooltip title={question.title} mouseEnterDelay={0.2}>
            <Link
              href={`/questions/${question.id}`}
              style={{ display: 'inline-block', maxWidth: '100%' }}
            >
              <Paragraph
                strong
                style={{ marginBottom: 6 }}
                ellipsis={{ rows: 1, tooltip: false }}
              >
                {question.title}
              </Paragraph>
            </Link>
          </Tooltip>

          {question.content && (
            <Paragraph
              type="secondary"
              style={{ marginBottom: 8 }}
              ellipsis={{ rows: 2 }}
            >
              {question.content ?? ''}
            </Paragraph>
          )}

          {tags.length > 0 && (
            <Space wrap>
              {tags.map((t) => (
                <Tag key={t} color="blue">
                  {t}
                </Tag>
              ))}
            </Space>
          )}
        </Col>

        {/* 右侧：收藏按钮 */}
        <Col>
          <Button
            type="text"
            loading={isLoading}
            disabled={isLoading}
            style={{ visibility: isEditMode ? 'visible' : 'hidden' }}
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
        </Col>
      </Row>
    </List.Item>
  );
}
