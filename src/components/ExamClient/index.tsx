'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Layout, Row, Col, Card, Space, Button, Slider, Badge } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import styles from './index.module.css';
import { QuestionInDetail } from '@/types/Questions';

import { useBankFavorites } from '@/app/hooks/useBankFavorites';
import { useQuestionSaved } from '@/app/hooks/useQuestionSaved';

const { Header, Content } = Layout;

type BtnType = 'primary' | 'default';
type BtnProps = { type: BtnType; danger: boolean; style?: CSSProperties };

function getBtnProps(opts: {
  isCurrent: boolean;
  isMarked: boolean;
  isDone: boolean;
}): BtnProps {
  const { isCurrent, isMarked, isDone } = opts;

  const doneStyle: CSSProperties = {
    backgroundColor: '#52c41a',
    color: '#fff',
    borderColor: '#52c41a',
  };

  if (isCurrent) return { type: 'primary', danger: false };
  if (isMarked) return { type: 'default', danger: true };
  if (isDone) return { type: 'default', danger: false, style: doneStyle };
  return { type: 'default', danger: false };
}

export default function ExamClient({
  questions,
  bankTitle,
  contentNodes, // ← 新增：server 预渲染的题干节点
  answerNodes, // ← 新增：server 预渲染的答案节点
}: {
  questions: QuestionInDetail[];
  bankTitle: string;
  contentNodes: ReactNode[]; // ← 关键：接收React节点数组
  answerNodes: ReactNode[]; // ← 关键：接收React节点数组
}) {
  const qn = questions.length;
  const [qi, setQi] = useState(0); // 当前题 index
  const [isAnswerHidden, setIsAnswerHidden] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [marks, setMarks] = useState<Set<number>>(new Set());
  const [answered, setAnswered] = useState<Set<number>>(new Set());

  // from router: exams/[bankId]
  const params = useParams();
  const bankId = Number(params.bankId);

  // Custom SWR hooks
  const {
    isFavorited,
    isLoading: bLoading,
    toggleFavorite,
  } = useBankFavorites(bankId);

  // 切题时自动隐藏答案
  useEffect(() => {
    setIsAnswerHidden(true);
  }, [qi]);

  const curr = questions[qi];

  const {
    isSaved,
    isLoading: qLoading,
    toggleSave,
  } = useQuestionSaved(Number(curr?.id));

  const toggleMark = () => {
    const id = Number(curr.id);
    setMarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const markAnswered = () => {
    const id = Number(curr.id);
    setAnswered((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <Layout className={styles.fullHeightLayout}>
      {/* 顶部 */}
      <Header className={styles.header}>
        <Row className={styles.headerInner}>
          <Col className={styles.bankTitle}>{bankTitle}</Col>
          <Col>
            <Button
              className="content-button-favorite"
              icon={<StarOutlined />}
              loading={bLoading}
              type={isFavorited ? 'primary' : 'default'}
              onClick={toggleFavorite}
            >
              {isFavorited ? 'Unfavorite' : 'Favorite'}
            </Button>
          </Col>
        </Row>
      </Header>

      {/* 内容区 */}
      <Content className={styles.contentArea}>
        <div className={styles.wrapper}>
          <Row gutter={24} align="stretch">
            {/* 左侧：题目 + 答案 */}
            <Col xs={24} md={16}>
              <Card className={styles.mainCard} bodyStyle={{ padding: 16 }}>
                {/* 题干区：flex-grow + 内部滚动 */}
                <div className={styles.questionPane} style={{ fontSize }}>
                  {contentNodes[qi]}
                </div>

                {/* 操作区：固定高度 */}
                <div className={styles.actionBar}>
                  <Button
                    className={[
                      'content-button-answer',
                      isAnswerHidden ? 'content-button-answer--show' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    type="primary"
                    onClick={() => {
                      setIsAnswerHidden(false);
                      markAnswered();
                    }}
                  >
                    👉 Show Answer
                  </Button>

                  <div className={styles.navBtns}>
                    <Space>
                      <Button
                        disabled={qi <= 0}
                        className="content-button-previous"
                        onClick={() => setQi((prev) => Math.max(prev - 1, 0))}
                      >
                        Previous
                      </Button>
                      <Button
                        disabled={qi >= qn - 1}
                        className="content-button-next"
                        onClick={() =>
                          setQi((prev) => Math.min(prev + 1, qn - 1))
                        }
                      >
                        Next
                      </Button>
                      <Button
                        className="content-button-mark"
                        type={
                          marks.has(Number(curr.id)) ? 'primary' : 'default'
                        }
                        onClick={toggleMark}
                      >
                        {marks.has(Number(curr.id)) ? 'Unmark' : 'Mark'}
                      </Button>
                    </Space>

                    <Space>
                      <Button
                        type="text"
                        size="small"
                        loading={qLoading}
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
                </div>

                {/* 答案区：flex-grow + 内部滚动；隐藏时高度为 0 */}
                <div
                  className={`${styles.answerPane} ${isAnswerHidden ? styles.isHidden : ''}`}
                  style={{ fontSize }}
                >
                  {!isAnswerHidden && answerNodes[qi]}
                </div>
              </Card>
            </Col>

            {/* 右侧：答题卡 + 设置（粘性吸顶） */}
            <Col xs={24} md={8}>
              <div className={styles.rightSticky}>
                <Card
                  title="Records"
                  extra={<Badge status="success" text="Done" />}
                  style={{ marginBottom: 16 }}
                  bodyStyle={{ paddingBottom: 8 }}
                >
                  <div className={styles.gridAnswerSheet}>
                    {questions.map((q, index) => {
                      const props = getBtnProps({
                        isCurrent: index === qi,
                        isMarked: marks.has(Number(q.id)),
                        isDone: answered.has(Number(q.id)),
                      });
                      return (
                        <Button
                          key={q.id}
                          size="small"
                          {...props}
                          onClick={() => setQi(index)}
                        >
                          {index + 1}
                        </Button>
                      );
                    })}
                  </div>
                </Card>

                <Card title="Settings">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <div style={{ marginBottom: 8 }}>Font size</div>
                      <Slider
                        min={14}
                        max={22}
                        value={fontSize}
                        onChange={setFontSize}
                      />
                    </div>
                  </Space>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}
