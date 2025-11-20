'use client';

import React from 'react';
import { Avatar, List, Space, Row, Col, Card, Button } from 'antd';
import { QuestionInShowList } from '@/types/Questions';
import MyBankListItem from '../ListItems';
import Link from 'next/link';
import { SearchOutlined } from '@ant-design/icons';

export function MyBankQuestionList({
  questions,
  isEditMode,
}: {
  questions: QuestionInShowList[];
  isEditMode: boolean;
}) {
  return (
    <>
      <List
        itemLayout="vertical"
        size="large"
        style={{
          width: '100%',
          margin: '0 auto',
          paddingInline: 18,
        }}
        pagination={{ pageSize: 10 }}
        dataSource={questions}
        renderItem={(q) => (
          <MyBankListItem key={q.id} question={q} isEditMode={isEditMode} />
        )}
      />
    </>
  );
}
