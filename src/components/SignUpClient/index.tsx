'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Button, Input, message } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import styles from './page.module.css';

type FormValues = {
  email: string;
  username: string;
  password: string;
  confirm: string;
  agree: boolean;
};

export function SignUpClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Sent POST request
  async function onFinish(values: FormValues) {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        return message.error(data?.error || 'Register failed');
      }
      message.success('Register successfully');
      router.replace('/'); // Redirect to homepage after successful registration
    } catch {
      message.error('Network error');
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className={styles.main}>
      <Card
        className={styles.card}
        title={<div className={styles.header}>Sign Up</div>}
      >
        <Form layout="vertical" onFinish={onFinish} requiredMark="optional">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email' },
              { type: 'email', message: 'Incorrect email address' },
            ]}
          >
            <Input
              placeholder="account@example.com"
              prefix={<MailOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please input username' },
              { min: 2, message: '2 charactes at least' },
              { max: 20, message: '20 characters max' },
            ]}
          >
            <Input
              placeholder="Nickname you prefer"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input password' },
              { min: 6, message: '6 digits at least' },
            ]}
            hasFeedback
          >
            <Input.Password
              placeholder="6 digits at least"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please input password again' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Inconsistent password'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Please input password again"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Button htmlType="submit" type="primary" block loading={loading}>
            Sign up
          </Button>

          <div className={styles.bottom}>
            <a onClick={() => router.push('/login')}>Login</a>
          </div>
        </Form>
      </Card>
    </main>
  );
}
