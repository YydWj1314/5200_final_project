import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { QuestionInShowList } from '@/types/Questions';
import { redirect } from 'next/navigation';
import { SearchClient } from '@/components/SearchClient';
import { searchQuestionsByStr } from '@/libs/database/db_questions';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { str?: string };
}) {
  const userId = await authSessionInServer();
  if (!userId) {
    redirect('/login');
  }

  const str = searchParams.str ?? '';
  const questions: QuestionInShowList[] = await searchQuestionsByStr(str);

  return <SearchClient questions={questions} />;
}
