// app/questions/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getQuestionByQid } from '@/libs/database/db_questions';
import MDXRenderer from '@/components/MDXRenderer';
import QuestionDetailClient from '@/components/QuestionDetailClient';

//
type PageProps = { params: { questionId: string } };

// 可选：SEO
// export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
//   const id = Number(params.id);
//   return { title: Number.isFinite(id) ? `题目 ${id} - 学习平台` : '题目 - 学习平台' };
// }

export default async function QuestionDetailPage({ params }: PageProps) {
  const questionId = Number(params.questionId);
  // console.log('[questions/[questionId]]', params);

  if (!Number.isFinite(questionId)) {
    notFound();
  }

  const question = await getQuestionByQid(questionId);
  if (!question) {
    notFound();
  }

  // console.log('[questions/[questionId]]', question);
  return (
    <QuestionDetailClient
      content={<MDXRenderer md={question.content ?? ''} />}
      answer={<MDXRenderer md={question.answer ?? ''} />}
      tags={question.tags ?? []}
    />
  );
}
