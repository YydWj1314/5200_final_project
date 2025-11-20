'use client';
import { useState } from 'react';
import { Row, Input, Button, theme } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { layoutStyles as s } from '../layoutStyles';

export function SearchInput() {
  const { token } = theme.useToken();
  const [q, setQ] = useState('');
  const router = useRouter();

  function toggleSearch() {
    const str = q.trim();
    if (!str) return;
    router.push(`/search?str=${encodeURIComponent(str)}`);
  }

  return (
    <Row
      // 只阻止冒泡，不要 preventDefault，保证能获得焦点
      onMouseDown={(e) => e.stopPropagation()}
      style={{ ...s.searchBox, border: `1px solid ${token.colorBorder}` }}
    >
      <Input
        style={s.searchInput}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onPressEnter={toggleSearch} // 回车触发
        suffix={
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={toggleSearch}
          />
        }
        placeholder="Search"
        variant="borderless"
        allowClear
      />
    </Row>
  );
}
