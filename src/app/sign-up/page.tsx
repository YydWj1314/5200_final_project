import { SignUpClient } from '@/components/SignUpClient';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const userId = await authSessionInServer();
  if (userId) {
    redirect('/');
  }

  return <SignUpClient />;
}
