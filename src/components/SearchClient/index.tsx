'use client';

import React from 'react';
import { useState } from 'react';
import { Avatar, List, Space, Row, Col, Card, Button } from 'antd';
import FilterHeader from '../FIlterHeader';
import { QuestionInShowList, QuestionInTopSaved } from '@/types/Questions';
import { useMemo, useCallback } from 'react';
import QuestionListItem from './QuestionListItem';
import { tokenize } from './hightlight';
import { useSearchParams } from 'next/navigation';

export function SearchClient({
  questions,
}: {
  questions: QuestionInShowList[];
}) {
  const [selectedTags, setSelectedTags] = useState(new Set<string>());
  const sp = useSearchParams();
  const str = sp.get('str') ?? '';
  const tokens = useMemo(() => tokenize(str), [str]);

  // Get tags from question list
  const allUniqueTags = useMemo(
    // userMemo() prevent Repetitive Calculation when redering
    () => [...new Set(questions.flatMap((q) => q.tags ?? []).filter(Boolean))],
    [questions],
  );

  // Call back from header component
  // Use useCallback avoid creating too much variables
  const toggleTagsCallback = useCallback((newSelectedTags: Set<string>) => {
    // Create a copy to ensure reference change (Set is a reference type)
    setSelectedTags((prev) => {
      // Idempotent update: don't update if value hasn't changed
      if (
        prev.size === newSelectedTags.size &&
        [...prev].every((t) => newSelectedTags.has(t))
      )
        return prev;
      return new Set(newSelectedTags);
    });
  }, []);

  // console.log(selectedTags);

  // Filter questions by selected tags
  const filteredQuesions = useMemo(() => {
    if (selectedTags.size === 0) {
      return questions;
    }
    // return filter questions
    return questions.filter(
      (q) => (q.tags ?? []).some((t) => selectedTags.has(t)), // tags exist in seletctedTags，return
    );
  }, [selectedTags, questions]);

  return (
    <>
      {/* Header */}
      <Space direction="vertical" style={{ display: 'flex' }}>
        <FilterHeader allTags={allUniqueTags} onChange={toggleTagsCallback} />
      </Space>

      {/* Content */}
      <Row gutter={12}>
        {/* Right-- question contents*/}
        <Col span={24}>
          <List
            itemLayout="vertical"
            size="large"
            pagination={{ pageSize: 8 }}
            dataSource={filteredQuesions}
            footer={
              <div>
                <b>Click question to get details</b>
              </div>
            }
            renderItem={(q) => (
              <QuestionListItem key={q.id} question={q} tokens={tokens} />
            )}
          />
        </Col>
      </Row>
    </>
  );
}
