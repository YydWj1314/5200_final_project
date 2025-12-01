import { QuestionClient } from '@/components/QuestionsClient';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { redirect } from 'next/navigation';
import { getAllQuestions } from '@/libs/database/db_questions';
import { getTopSavedQuestions } from '@/libs/database/db_questions';

export default async function QuestionsPage() {
  const LIMIT = 10;
  // Authentication & get user id
  const userId = await authSessionInServer();
  // Auth failed, redirect
  if (!userId) {
    redirect('/login');
  }

  const [questions, topSavedQuestions] = await Promise.all([
    getAllQuestions(), // Your main list
    getTopSavedQuestions(LIMIT), // Top 10 saved
  ]);
  // console.log(questions);
  return <QuestionClient questions={questions} topSaved={topSavedQuestions} />;
}
