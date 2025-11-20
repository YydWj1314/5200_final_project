'use client';
import { useState } from 'react';
import { Tag, Space, Button, Card, Row, Col } from 'antd';

export default function FilterHeader({
  allTags,
  onChange,
}: {
  allTags: string[];
  onChange: (next: Set<string>) => void; // call back --> pass params to father
}) {
  // state
  const [seletctedTags, setSelectedTags] = useState(new Set<string>());

  function toggleTag(tag: string, checked: boolean) {
    setSelectedTags((prev) => {
      const newSelectedTags = new Set(prev);
      checked ? newSelectedTags.add(tag) : newSelectedTags.delete(tag);
      onChange(newSelectedTags);
      return newSelectedTags;
    });
  }

  function toggleClear() {
    setSelectedTags(() => {
      const empty = new Set<string>();
      onChange(empty);
      return empty;
    });
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      <div>
        {/* Header  */}
        <Row justify="space-between" align="middle">
          <Col>
            <h2>Tags:</h2>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            {seletctedTags.size > 0 && (
              <Button size="small" onClick={toggleClear}>
                Clear
              </Button>
            )}
          </Col>
        </Row>
        {/* Tags */}
        <Space wrap size={[8, 8]} style={{ marginTop: 8 }}>
          {allTags.map<React.ReactNode>((tag) => (
            <Tag.CheckableTag
              key={tag}
              checked={seletctedTags.has(tag)}
              onChange={(checked) => toggleTag(tag, checked)}
            >
              {tag}
            </Tag.CheckableTag>
          ))}
        </Space>
      </div>
    </Card>
  );
}
