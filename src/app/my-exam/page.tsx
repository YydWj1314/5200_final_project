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

  // If function directly returns array:
  // const items = await getSavedQuestionsByUserId(userId);

  // If function returns object:
  const myQuestions = await getSavedQuestionsByUserId(userId);

  // Render each question's content/answer as md React nodes on server side:
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
