'use client';

import { useEffect, useState, ReactNode } from 'react';
import {
  Layout,
  Row,
  Col,
  Card,
  Space,
  Button,
  Slider,
  Badge,
  Modal,
  Spin,
  message,
  Input,
} from 'antd';
import {
  StarOutlined,
  StarFilled,
  RobotOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import styles from './index.module.css';
import { QuestionInDetail } from '@/types/Questions';
import ReactMarkdown from 'react-markdown';

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
  contentNodes, // Server pre-rendered question nodes
  answerNodes, // Server pre-rendered answer nodes
}: {
  questions: QuestionInDetail[];
  bankTitle: string;
  contentNodes: ReactNode[]; // Receive React node array
  answerNodes: ReactNode[]; // Receive React node array
}) {
  const qn = questions.length;
  const [qi, setQi] = useState(0); // Current question index
  const [isAnswerHidden, setIsAnswerHidden] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [marks, setMarks] = useState<Set<number>>(new Set());
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  
  // User SQL input state (per question)
  const [userSQLInputs, setUserSQLInputs] = useState<Map<number, string>>(new Map());
  const [sqlComparisonResult, setSqlComparisonResult] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);
  
  // AI query related state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // SQL check related state
  const [isSqlCheckModalOpen, setIsSqlCheckModalOpen] = useState(false);
  const [userSQL, setUserSQL] = useState<string>('');
  const [sqlCheckResult, setSqlCheckResult] = useState<string>('');
  const [isSqlChecking, setIsSqlChecking] = useState(false);

  // from router: exams/[bankId]
  const params = useParams();
  const bankId = Number(params.bankId);

  // Custom SWR hooks
  const {
    isFavorited,
    isLoading: bLoading,
    toggleFavorite,
  } = useBankFavorites(bankId);

  const curr = questions[qi];
  
  // Auto hide answer when switching questions
  useEffect(() => {
    setIsAnswerHidden(true);
    setSqlComparisonResult(''); // Clear comparison result when switching questions
  }, [qi]);
  
  // Get current user SQL input
  const currentUserSQL = userSQLInputs.get(Number(curr?.id)) || '';
  
  // Update user SQL input
  const handleUserSQLChange = (value: string) => {
    if (!curr) return;
    setUserSQLInputs((prev) => {
      const next = new Map(prev);
      next.set(Number(curr.id), value);
      return next;
    });
  };
  
  // Normalize SQL for comparison (remove extra whitespace, convert to lowercase)
  const normalizeSQL = (sql: string): string => {
    return sql
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*\(\s*/g, '(') // Remove spaces around opening parentheses
      .replace(/\s*\)\s*/g, ')') // Remove spaces around closing parentheses
      .replace(/\s*,\s*/g, ',') // Remove spaces around commas
      .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
      .toLowerCase();
  };

  // Compare user SQL with answer
  const compareUserSQL = () => {
    if (!curr) return;
    if (!currentUserSQL.trim()) {
      message.warning('Please enter your SQL code first');
      return;
    }
    
    const correctSQL = curr.answer || '';
    if (!correctSQL.trim()) {
      message.warning('No answer available for comparison');
      return;
    }
    
    setIsComparing(true);
    
    // Normalize both SQLs for comparison
    const normalizedUserSQL = normalizeSQL(currentUserSQL);
    const normalizedCorrectSQL = normalizeSQL(correctSQL);
    
    // Check if they match
    const isExactMatch = normalizedUserSQL === normalizedCorrectSQL;
    
    // Generate comparison result
    let result = '';
    if (isExactMatch) {
      result = `## ✅ Correct!\n\nYour SQL matches the reference answer.\n\n**Your SQL:**\n\`\`\`sql\n${currentUserSQL}\n\`\`\`\n\n**Reference Answer:**\n\`\`\`sql\n${correctSQL}\n\`\`\``;
      message.success('Your SQL is correct!');
    } else {
      result = `## ❌ Not Matching\n\nYour SQL does not match the reference answer.\n\n**Your SQL:**\n\`\`\`sql\n${currentUserSQL}\n\`\`\`\n\n**Reference Answer:**\n\`\`\`sql\n${correctSQL}\n\`\`\``;
      message.warning('SQL does not match the reference answer');
    }
    
    setSqlComparisonResult(result);
    setIsComparing(false);
  };
  
  // Ensure curr exists
  if (!curr) {
    return null;
  }

  const {
    isSaved,
    isLoading: qLoading,
    toggleSave,
  } = useQuestionSaved(Number(curr.id));

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

  // AI query function (streaming response)
  const handleAiQuery = async () => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiResponse('');

    try {
      // Extract question and answer text content
      const questionText = curr.content || '';
      const answerText = curr.answer || '';

      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          answer: answerText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      setIsAiLoading(false); // Close loading after starting to receive data

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                return; // Stream ended
              }
              if (data.error) {
                message.error(data.error);
                setAiResponse('Sorry, I encountered an error. Please try again.');
                return;
              }
              if (data.content) {
                setAiResponse((prev) => prev + data.content);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('[AI Query Error]', error);
      message.error('Failed to connect to AI service');
      setAiResponse('Sorry, I encountered an error. Please try again.');
      setIsAiLoading(false);
    }
  };

  return (
    <Layout className={styles.fullHeightLayout}>
      {/* Header */}
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

      {/* Content Area */}
      <Content className={styles.contentArea}>
        <div className={styles.wrapper}>
          <Row gutter={24} align="stretch">
            {/* Left: Question + Answer */}
            <Col xs={24} md={16}>
              <Card
                className={styles.mainCard}
                styles={{ body: { padding: 16 } }}
              >
                {/* Question Area: flex-grow + internal scroll */}
                <div className={styles.questionPane} style={{ fontSize }}>
                  {contentNodes[qi]}
                </div>

                {/* Action Bar: fixed height */}
                <div className={styles.actionBar}>
                  <Space>
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
                        // If user has entered SQL, compare it automatically
                        if (currentUserSQL.trim()) {
                          compareUserSQL();
                        }
                      }}
                    >
                      👉 Show Answer
                    </Button>
                    <Button
                      type="default"
                      icon={<RobotOutlined />}
                      onClick={handleAiQuery}
                    >
                      Ask AI
                    </Button>
                    <Button
                      type="default"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        setIsSqlCheckModalOpen(true);
                        setUserSQL('');
                        setSqlCheckResult('');
                      }}
                    >
                      Check SQL
                    </Button>
                  </Space>

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

                {/* User SQL Input Area */}
                <div className={styles.userSQLArea}>
                  <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
                    Your SQL Code:
                  </div>
                  <Input.TextArea
                    value={currentUserSQL}
                    onChange={(e) => handleUserSQLChange(e.target.value)}
                    placeholder="Enter your SQL code here..."
                    rows={6}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  />
                  {currentUserSQL.trim() && (
                    <Button
                      type="default"
                      onClick={compareUserSQL}
                      loading={isComparing}
                      style={{ marginBottom: 12 }}
                    >
                      Compare with Answer
                    </Button>
                  )}
                  {sqlComparisonResult && (
                    <div className={styles.comparisonResult}>
                      <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
                        Comparison Result:
                      </div>
                      <div
                        style={{
                          padding: 12,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 4,
                          fontSize: 13,
                          lineHeight: 1.8,
                          maxHeight: 300,
                          overflow: 'auto',
                        }}
                      >
                        <ReactMarkdown>{sqlComparisonResult}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>

                {/* Answer Area: flex-grow + internal scroll; height 0 when hidden */}
                <div
                  className={`${styles.answerPane} ${isAnswerHidden ? styles.isHidden : ''}`}
                  style={{ fontSize }}
                >
                  {!isAnswerHidden && (
                    <>
                      <div style={{ marginBottom: 12, fontWeight: 500, fontSize: 14 }}>
                        Reference Answer:
                      </div>
                      {answerNodes[qi]}
                    </>
                  )}
                </div>
              </Card>
            </Col>

            {/* Right: Answer Sheet + Settings (sticky top) */}
            <Col xs={24} md={8}>
              <div className={styles.rightSticky}>
                <Card
                  title="Records"
                  extra={<Badge status="success" text="Done" />}
                  style={{ marginBottom: 16 }}
                  styles={{ body: { paddingBottom: 8 } }}
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

      {/* AI Query Modal */}
      <Modal
        title={
          <Space>
            <RobotOutlined />
            <span>AI Assistant</span>
          </Space>
        }
        open={isAiModalOpen}
        onCancel={() => {
          setIsAiModalOpen(false);
          setAiResponse('');
        }}
        footer={[
          <Button key="close" onClick={() => setIsAiModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        <div style={{ minHeight: 300, maxHeight: 600, overflow: 'auto' }}>
          {isAiLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#666' }}>
                AI is thinking...
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                padding: '8px 0',
              }}
            >
              {aiResponse ? (
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              ) : (
                <div style={{ color: '#999', textAlign: 'center' }}>
                  Waiting for AI response...
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* SQL Check Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>SQL Code Checker</span>
          </Space>
        }
        open={isSqlCheckModalOpen}
        onCancel={() => {
          setIsSqlCheckModalOpen(false);
          setUserSQL('');
          setSqlCheckResult('');
        }}
        footer={[
          <Button
            key="check"
            type="primary"
            loading={isSqlChecking}
            onClick={async () => {
              if (!userSQL.trim()) {
                message.warning('Please enter your SQL code');
                return;
              }

              setIsSqlChecking(true);
              setSqlCheckResult('');

              try {
                const response = await fetch('/api/ai/check-sql', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userSQL: userSQL.trim(),
                    correctSQL: curr.answer || '',
                    question: curr.content || '',
                  }),
                });

                const data = await response.json();

                if (data.success) {
                  setSqlCheckResult(data.feedback);
                } else {
                  message.error(data.error || 'Failed to check SQL');
                  setSqlCheckResult('Sorry, I encountered an error. Please try again.');
                }
              } catch (error) {
                console.error('[SQL Check Error]', error);
                message.error('Failed to connect to AI service');
                setSqlCheckResult('Sorry, I encountered an error. Please try again.');
              } finally {
                setIsSqlChecking(false);
              }
            }}
          >
            Check SQL
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setIsSqlCheckModalOpen(false);
              setUserSQL('');
              setSqlCheckResult('');
            }}
          >
            Close
          </Button>,
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              Your SQL Code:
            </div>
            <textarea
              value={userSQL}
              onChange={(e) => setUserSQL(e.target.value)}
              placeholder="Enter your SQL code here..."
              style={{
                width: '100%',
                minHeight: 150,
                padding: 12,
                fontFamily: 'monospace',
                fontSize: 14,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                resize: 'vertical',
              }}
            />
          </div>

          {sqlCheckResult && (
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                AI Feedback:
              </div>
              <div
                style={{
                  minHeight: 200,
                  maxHeight: 500,
                  overflow: 'auto',
                  padding: 16,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4,
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                <ReactMarkdown>{sqlCheckResult}</ReactMarkdown>
              </div>
            </div>
          )}
        </Space>
      </Modal>
    </Layout>
  );
}
