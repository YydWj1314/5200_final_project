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
  tokens = [], // 新增：从父组件接收 tokens
}: {
  question: QuestionInShowList;
  tokens?: string[];
}) {
  const { isSaved, isLoading, toggleSave } = useQuestionSaved(question.id);

  // 只截取命中附近的片段
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
            {/* 标题/题干高亮 */}
            {highlightText(question.content ?? '', tokens)}
          </Link>
        }
        description={
          Array.isArray(question.tags) ? (
            <Space size={4} wrap>
              {question.tags.map((t) => (
                <Tag key={t}>{highlightText(t, tokens)}</Tag> // hightlight
              ))}
            </Space>
          ) : (
            question.tags
          )
        }
      />

      {/* 答案区（摘要 + 高亮） */}
      <div style={{ marginTop: 12 }}>
        [Answer]: {highlightText(answerSnippet, tokens) || '（暂无）'}
      </div>

      {/* 内容摘要（可选：如果你想在标题下再放一段题干摘要） */}
      <div style={{ marginTop: 8, color: '#666' }}>
        {highlightText(contentSnippet, tokens)}
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
