import { getBankFavoritesByUid } from '@/libs/database/db_bank_favorites';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import MyBanksClient from '@/components/MyBanksClient';
import { groupBy } from '@/libs/utils/groupBy';
import { BankInShowList } from '@/types/Banks';
import { redirect } from 'next/navigation';
import { getSavedQuestionsByUserId } from '@/libs/database/db_questions';

// DAL
// myBanks：Server Component
export default async function MyBanksPage() {
  // Athentication

  // Authentication & get user id
  const userId = await authSessionInServer();
  // Auth failed, redirect
  if (!userId) {
    redirect('/login');
  }

  // Get data from db
  const [bankFavorites, questionSaved] = await Promise.all([
    getBankFavoritesByUid(userId),
    getSavedQuestionsByUserId(userId),
  ]);

  // Group by topic
  const groupedBankFavorutes: Record<string, BankInShowList[]> = groupBy(
    bankFavorites,
    (b) => b.topic?.trim() || '未命名题库',
  );

  return (
    <MyBanksClient banks={groupedBankFavorutes} questions={questionSaved} />
  );
}
