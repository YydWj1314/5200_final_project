'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import {
  Layout,
  Menu,
  Dropdown,
  Row,
  Col,
  Button,
  Input,
  Space,
  theme,
} from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { layoutStyles as s } from './layoutStyles';
import Banner from '../Banner';
import { useMe } from '@/app/hooks/useMe';
import { SearchInput } from './SerachInput';

const { Header, Content, Footer } = Layout;

type Props = { children: React.ReactNode };

const menus = [
  { key: '/', label: <Link href="/">Home</Link> },
  { key: '/my-banks', label: <Link href="/my-banks">MyBanks</Link> },
  { key: '/questions', label: <Link href="/questions">Questions</Link> },
];

export default function BasicLayout({ children }: Props) {
  const pathname = usePathname(); // get current url
  const router = useRouter();
  const { token } = theme.useToken();
  const year = new Date().getFullYear();

  // Get session user
  const { me, isLoading, mutate } = useMe();
  // console.log('Global:', me);

  // Common menu after login
  const commonItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push('/profile'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: async () => {
        await fetch('/api/auth/logout', {
          // logout api
          method: 'DELETE',
          credentials: 'include',
        });
        mutate(null, false);
        router.replace('/login');
      },
    },
  ];

  // Admin menu TODO
  const adminItems: MenuProps['items'] = [
    { key: 'dashboard', label: 'Admin', onClick: () => router.push('/admin') },
    { type: 'divider' },
    { key: 'Logout', label: 'Admin' },
  ];

  return (
    <>
      <Layout>
        {/* Top Bar */}
        <Header style={s.header}>
          {/* Left: Logo + Title */}
          <Link href="/" style={s.brand}>
            <Image src="/assets/logo.svg" alt="logo" width={28} height={28} />
            <span style={s.brandTitle}>SqlMaster</span>
          </Link>

          {/* Center: Navigation Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={menus}
            theme="light"
            style={s.menu}
          />

          {/* Right: Search + Login/Avatar */}
          <Row gutter={[12, 12]} align="middle" wrap={false}>
            <Col>
              <SearchInput />
            </Col>

            <Col>
              {isLoading ? (
                // 1. Loading
                <Button type="primary" shape="round" loading>
                  Loading...
                </Button>
              ) : !me ? (
                // 2. No me or no user_role => Not logged in
                <Button
                  type="primary"
                  shape="round"
                  icon={<UserOutlined />}
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>
              ) : (
                // 3. Has me and user_role => Logged in
                <Dropdown.Button menu={{ items: commonItems }}>
                  <Space>{me.user_name ?? 'Anonymous'}</Space>
                </Dropdown.Button>
              )}
            </Col>
          </Row>
        </Header>
      </Layout>

      {/* Banner */}
      <Banner></Banner>

      {/* Content */}
      <Layout style={s.layout}>
        {/* Content Area (auto-expand) */}
        <Content style={s.content}>
          <div style={s.contentInner}>{children}</div>
        </Content>

        {/* Footer (sticky bottom) */}
        <Footer style={s.footer}>
          <div>
            © {year} Made with curiosity, patience & love <br />
            by yyd in California
          </div>
        </Footer>
      </Layout>
    </>
  );
}
