import { redirect } from 'next/navigation';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { LoginClient } from '@/components/LoginClient';

/**
 * Login page
 * @returns
 */
export default async function LoginPage() {
  const userId = await authSessionInServer();
  if (userId) {
    redirect('/');
  }

  return <LoginClient />;
}
