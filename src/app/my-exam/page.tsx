import {
  getQuestionsByBankId,
  getSavedQuestionsByUserId,
} from '@/libs/database/db_questions';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { redirect } from 'next/navigation';
import MyExamClient from '@/components/MyExamClient';
import MDXRenderer from '@/components/MDXRenderer';
export default async function MyQuestionsPage() {
  const userId = await authSessionInServer();
  if (!userId) redirect('/login');

  // 如果函数直接返回数组：
  // const items = await getSavedQuestionsByUserId(userId);

  // 如果函数返回对象：
  const myQuestions = await getSavedQuestionsByUserId(userId);

  //  在 server 端把每道题的 content/answer 渲染成 md React 节点：
  const contentNodes = myQuestions.map((q) => (
    <MDXRenderer key={`c-${q.id}`} md={q.content ?? ''} />
  ));

  const answerNodes = myQuestions.map((q) => (
    <MDXRenderer key={`q-${q.id}`} md={q.content ?? ''} />
  ));

  return (
    <MyExamClient
      questions={myQuestions}
      contentNodes={contentNodes}
      answerNodes={answerNodes}
    />
  );
}
