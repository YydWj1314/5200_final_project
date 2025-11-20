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

  // 拉 session 用户
  const { me, isLoading, mutate } = useMe();
  // console.log('Global:', me);

  // 登录后通用菜单
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

  // 管理员菜单 TODO
  const adminItems: MenuProps['items'] = [
    { key: 'dashboard', label: 'Admin', onClick: () => router.push('/admin') },
    { type: 'divider' },
    { key: 'Logout', label: 'Admin' },
  ];

  return (
    <>
      <Layout>
        {/* 顶部栏 */}
        <Header style={s.header}>
          {/* 左：Logo + Title */}
          <Link href="/" style={s.brand}>
            <Image src="/assets/logo.svg" alt="logo" width={28} height={28} />
            <span style={s.brandTitle}>SqlMaster</span>
          </Link>

          {/* 中：导航菜单 */}
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={menus}
            theme="light"
            style={s.menu}
          />

          {/* 右：搜索 + 登录/头像 */}
          <Row gutter={[12, 12]} align="middle" wrap={false}>
            <Col>
              <SearchInput />
            </Col>

            <Col>
              {isLoading ? (
                // 1. Loading
                <Button type="primary" shape="round">
                  Loadin...
                </Button>
              ) : !me ? (
                // 2. 没有 me 或者没有 user_role => 未登录
                <Button
                  type="primary"
                  shape="round"
                  icon={<UserOutlined />}
                  onClick={() => router.push('/login')}
                >
                  Login
                </Button>
              ) : (
                // 3. 有 me 且有 user_role => 已登录
                <Dropdown.Button menu={{ items: commonItems }}>
                  <Space>{me.user_name ?? '无名侠客'}</Space>
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
        {/* 内容区（自适应撑开） */}
        <Content style={s.content}>
          <div style={s.contentInner}>{children}</div>
        </Content>

        {/* 底部（贴底） */}
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
