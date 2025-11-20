'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Button, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { mutate } from 'swr';
import styles from './index.module.css';
import Link from 'next/link';

export function LoginClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onFinish(values: { user_account: string; password: string }) {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return message.error(data.error || '登录失败');

      await mutate('/api/auth/me');
      message.success('Login successfully');
      // redirect to homepage
      router.replace('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <Card
        className={styles.card}
        title={
          <div className={styles.header}>
            <span>Login</span>
          </div>
        }
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="user_account"
            label="Account"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input placeholder="Email address" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" prefix={<LockOutlined />} />
          </Form.Item>

          <Button htmlType="submit" type="primary" block loading={loading}>
            Submit
          </Button>

          <div className={styles.bottom}>
            <Link href="/sign-up">Sign up</Link>
            <div>Forget password?</div>
          </div>
        </Form>
      </Card>
    </main>
  );
}
