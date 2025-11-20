import HomeClient from '@/components/HomeClient';
import { getAllBanks } from '../libs/database/db_question_banks';
import { groupBy } from '../libs/utils/groupBy';
import { Bank } from '@/types/Banks';

// Homepage：Server Component
export default async function Home() {
  // 直接调用 DAL
  const banks = await getAllBanks(99);

  // Group by topic
  const groupedBanks: Record<string, Bank[]> = groupBy(
    banks,
    (b) => b.topic?.trim() || '未命名题库',
  );
  // props transfer data to cliend
  return <HomeClient items={groupedBanks} />;
}
