import ExamClient from '@/components/ExamClient';
import { getBankById } from '@/libs/database/db_question_banks';
import { getQuestionsByBankId } from '@/libs/database/db_questions';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import MDXRenderer from '@/components/MDXRenderer';

// server
export default async function ExamPage({
  params,
}: {
  params: { bankId: string };
}) {
  const userId = await authSessionInServer();
  if (!userId) {
    redirect('/login');
  }

  const bankId = Number(params.bankId);
  if (!Number.isFinite(bankId) || bankId <= 0) notFound();

  const [questions, bank] = await Promise.all([
    getQuestionsByBankId(bankId),
    getBankById(bankId),
  ]);
  if (!bank) notFound();

  //  在 server 端把每道题的 content/answer 渲染成 md React 节点：
  const contentNodes = questions.map((q) => (
    <MDXRenderer key={`c-${q.id}`} md={q.content ?? ''} />
  ));
  const answerNodes = questions.map((q) => (
    <MDXRenderer key={`a-${q.id}`} md={q.answer ?? ''} />
  ));

  return (
    <ExamClient
      questions={questions}
      bankTitle={bank.title}
      contentNodes={contentNodes}
      answerNodes={answerNodes}
    />
  );
}
