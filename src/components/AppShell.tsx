'use client';

import { useEffect } from 'react';
import BasicLayout from '@/components/GlobalLayout';
import { usePathname, useRouter } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Put your original InitLayout logic here
  // const doInit = useCallback(() => {
  //   console.log('hello welcome to my project');
  // }, []);

  // useEffect(() => {
  //   doInit();
  // }, [doInit]);

  const pathname = usePathname();
  const router = useRouter();
  // Refresh page when path change
  useEffect(() => {
    router.refresh();
  }, [pathname, router]);

  return <BasicLayout>{children}</BasicLayout>;
}
