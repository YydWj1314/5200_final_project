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
      // Only stop propagation, don't preventDefault, to ensure focus
      onMouseDown={(e) => e.stopPropagation()}
      style={{ ...s.searchBox, border: `1px solid ${token.colorBorder}` }}
    >
      <Input
        style={s.searchInput}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onPressEnter={toggleSearch} // Trigger on Enter
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
