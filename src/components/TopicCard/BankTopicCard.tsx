'use client';

import { Bank } from '@/types/Banks';
import { Button, Card, Checkbox, Popconfirm, message } from 'antd';
import { BankInShowList } from '@/types/Banks';
import Link from 'next/link';
export default function BankTopicCard({
  topic,
  banks,
  isEditMode,
  selected, // selected id
  onToggleOne, // callback
  onToggleAll, // callback
}: {
  topic: string;
  banks: BankInShowList[];
  isEditMode: boolean;
  selected: Set<number>;
  onToggleOne: (id: number, checked: boolean) => void;
  onToggleAll: (ids: number[], checked: boolean) => void;
}) {
  const total = banks.length;
  const selectedCount = banks.filter((b) => selected.has(b.id)).length;
  const isAllChecked = total > 0 && selectedCount === total;
  const isIndeterminate = selectedCount > 0 && selectedCount < total;

  const ids = banks.map((b) => b.id);

  return (
    <Card
      hoverable
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {topic}
          </span>
        </div>
      }
      style={{ width: '100%', minWidth: 250, maxWidth: 560 }}
      styles={{
        header: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          minHeight: 48,
          paddingInline: 16,
        },
      }}
      extra={
        isEditMode ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginLeft: 4,
            }}
          >
            <Checkbox
              className="small-checkbox"
              indeterminate={isIndeterminate}
              checked={isAllChecked}
              onChange={(e) => onToggleAll(ids, e.target.checked)} // callback
            >
              {/* All checkbox */}
              <span className="small-checkbox__label">All</span>
            </Checkbox>
          </div>
        ) : null
      }
    >
      {banks.length ? (
        <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'none' }}>
          {banks.map((b) => (
            <li key={b.id} title={b.title}>
              {isEditMode ? (
                <Checkbox
                  checked={selected.has(b.id)}
                  onChange={(e) => onToggleOne(b.id, e.target.checked)} // callback
                >
                  {b.title}
                </Checkbox>
              ) : (
                <Link href={`/exams/${b.id}`}>{b.title || 'No title'}</Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ color: '#999' }}>No questions</div>
      )}
    </Card>
  );
}
