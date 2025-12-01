'use client';

import Link from 'next/link';
import { List, Button, Space, Tag } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { useQuestionSaved } from '@/app/hooks/useQuestionSaved';
import type { QuestionInShowList } from '@/types/Questions';
import { highlightText, makeSnippet } from '../hightlight';
import { useMemo } from 'react';

export default function QuestionListItem({
  question,
  tokens = [], // New: receive tokens from parent component
}: {
  question: QuestionInShowList;
  tokens?: string[];
}) {
  const { isSaved, isLoading, toggleSave } = useQuestionSaved(question.id);

  // Only extract fragments around matches
  const contentSnippet = useMemo(
    () => makeSnippet(question.content ?? '', tokens, 80),
    [question.content, tokens],
  );
  const answerSnippet = useMemo(
    () => makeSnippet(question.answer ?? '', tokens, 60),
    [question.answer, tokens],
  );

  return (
    <List.Item
      key={question.id}
      style={{ paddingBlock: 40, position: 'relative' }}
    >
      <List.Item.Meta
        title={
          <Link href={`/questions/${question.id}`}>
            {/* Title/question highlight */}
            {highlightText(question.content ?? '', tokens)}
          </Link>
        }
        description={
          Array.isArray(question.tags) ? (
            <Space size={4} wrap>
              {question.tags.map((t) => (
                <Tag key={t}>{highlightText(t, tokens)}</Tag> // highlight
              ))}
            </Space>
          ) : (
            question.tags
          )
        }
      />

      {/* Answer area (summary + highlight) */}
      <div style={{ marginTop: 12 }}>
        [Answer]: {highlightText(answerSnippet, tokens) || '(None)'}
      </div>

      {/* Content summary (optional: if you want to add a question summary under the title) */}
      <div style={{ marginTop: 8, color: '#666' }}>
        {highlightText(contentSnippet, tokens)}
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
