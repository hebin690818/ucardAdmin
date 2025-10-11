import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, ReloadOutlined } from '@ant-design/icons';
import type { LoginForm } from '../types';
import { authUtils } from '../utils/auth';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');

  // 加载验证码
  const loadCaptcha = async () => {
    try {
      setCaptchaLoading(true);
      const data = await authUtils.getCaptcha();
      setCaptchaId(data.captchaId);
      setCaptchaImage(data.captchaImage);
    } catch (error) {
      message.error('获取验证码失败');
    } finally {
      setCaptchaLoading(false);
    }
  };

  // 组件加载时获取验证码
  useEffect(() => {
    loadCaptcha();
  }, []);

  const onFinish = async (values: LoginForm) => {
    if (!captchaId) {
      message.error('请先获取验证码');
      return;
    }

    try {
      setLoading(true);
      await authUtils.login(values.username, values.password, captchaId, values.captcha);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
      // 登录失败后刷新验证码
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Card className="login-card">
          <div className="login-header">
            <h1>UCard 管理系统</h1>
            <p>欢迎登录后台管理系统</p>
          </div>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <div className="captcha-container">
                <Form.Item
                  name="captcha"
                  noStyle
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <Input
                    prefix={<SafetyOutlined />}
                    placeholder="验证码"
                    maxLength={6}
                    style={{ width: 'calc(100% - 130px)' }}
                  />
                </Form.Item>
                <div className="captcha-image-wrapper">
                  {captchaLoading ? (
                    <div className="captcha-loading">
                      <Spin size="small" />
                    </div>
                  ) : captchaImage ? (
                    <img
                      src={captchaImage}
                      alt="验证码"
                      className="captcha-image"
                      onClick={loadCaptcha}
                    />
                  ) : (
                    <div className="captcha-placeholder" onClick={loadCaptcha}>
                      点击获取
                    </div>
                  )}
                  <Button
                    type="link"
                    icon={<ReloadOutlined />}
                    onClick={loadCaptcha}
                    className="captcha-refresh"
                    title="刷新验证码"
                  />
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登录
              </Button>
            </Form.Item>
          </Form>
          <div className="login-footer">
            <p>提示：请输入用户名、密码和验证码进行登录</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

