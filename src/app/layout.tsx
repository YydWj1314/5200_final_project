import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AppShell from '../components/AppShell';
import SWRProvider from '@/libs/utils/swr/SWRProvider';

// server side
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          {/* Server components in outer layer */}
          <SWRProvider>
            <AppShell>{children}</AppShell>
          </SWRProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
