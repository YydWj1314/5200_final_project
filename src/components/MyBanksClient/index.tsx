'use client';
import {
  List,
  Row,
  Col,
  Switch,
  Popconfirm,
  Button,
  message,
  Card,
  Space,
  Divider,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import BankTopicCard from '../TopicCard/BankTopicCard';
import { BankInShowList } from '@/types/Banks';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionInShowList } from '@/types/Questions';
import { MyBankQuestionList } from './QuestionList';
import Link from 'next/link';

interface GroupedBanks {
  // groupKey --> topic
  [groupKey: string]: BankInShowList[];
}

export default function MyBanksClient({
  banks,
  questions,
}: {
  banks: GroupedBanks;
  questions: QuestionInShowList[];
}) {
  // Convert { [groupKey(topic)]: Bank...} obj
  //   to array [[topic, banks] ...] for List rendering
  const bankGroupArr = Object.entries(banks);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // console.log('delete item selected', selectedItems);

  // Click Delete button
  async function toggleDelete(selectedItems: Set<number>) {
    // Check items set is not none
    if (selectedItems.size === 0) {
      message.error('Please select items!');
      return;
    }
    // send request
    const res = await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankIds: Array.from(selectedItems) }), // set -> array -> JSON
    });
    if (!res.ok) {
      message.error('Delete failed');
      throw new Error('Operation Failed');
    }
    // Get response
    const data = await res.json(); // { ok: true, count: ... }
    setSelectedItems(new Set());
    router.refresh(); // refresh page
    message.success('Delete successfully');
    return data;
  }

  // callback function --> select one item
  const onToggleOne = useCallback((id: number, checked: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }, []);

  // // callback function --> select all
  const onToggleAll = useCallback((ids: number[], checked: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (checked) {
        ids.forEach((id) => next.add(id));
      } else {
        ids.forEach((id) => next.delete(id));
      }
      return next;
    });
  }, []);

  return (
    <Space direction="vertical" size={10} style={{ width: '100%' }}>
      {/* Edit Button row */}
      <Row justify="end" gutter={14}>
        {/* delete button */}
        <Col>
          {isEditMode && (
            <Popconfirm
              title="Delete selected banks?"
              description="Inrecoverable operation"
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, size: 'small' }}
              cancelButtonProps={{ size: 'small' }}
              onConfirm={() => toggleDelete(selectedItems)}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Col>
        {/* edit button */}
        <Col
          style={{
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ marginRight: 8 }}>Edit Mode</span>
          <Switch
            checked={isEditMode}
            onChange={(checked) => setIsEditMode(checked)}
          />
        </Col>
      </Row>

      {/* Content  */}
      <Card title="Favorite Banks">
        <List
          grid={{ gutter: 30, xs: 1, sm: 1, md: 1, lg: 2 }}
          style={{
            maxWidth: 1188,
            margin: '0 auto',
            paddingInline: 18, // = gutter/2, offset .ant-row's negative margin
          }}
          dataSource={bankGroupArr}
          rowKey={([groupKey]) => groupKey}
          // === Render list ===
          renderItem={([groupKey, banks]) => {
            // TODO Optional: use first bank with image as cover
            // const coverSrc = banks.find((b) => b.picture)?.picture ?? null;
            return (
              <List.Item style={{ display: 'flex', justifyContent: 'center' }}>
                <BankTopicCard
                  topic={groupKey}
                  banks={banks}
                  isEditMode={isEditMode}
                  selected={selectedItems}
                  onToggleOne={onToggleOne}
                  onToggleAll={onToggleAll}
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Card
        title="Saved Questions"
        extra={
          <Space>
            <Link href="/my-exam">Practice</Link>
            <Divider type="vertical" />
            <Link href="/questions">All</Link>
          </Space>
        }
      >
        <MyBankQuestionList questions={questions} isEditMode={isEditMode} />
      </Card>
    </Space>
  );
}
