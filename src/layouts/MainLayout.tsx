import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { authUtils } from '../utils/auth';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const user = authUtils.getUser();

  // 菜单项配置
  const menuItems: MenuProps['items'] = [
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户列表',
    },
    {
      key: '/cards',
      icon: <CreditCardOutlined />,
      label: 'Card列表',
    },
    {
      key: '/card-applys',
      icon: <FileTextOutlined />,
      label: '卡片申请',
    },
    {
      key: '/admins',
      icon: <TeamOutlined />,
      label: '管理员列表',
    },
  ];

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        authUtils.logout();
        navigate('/login');
      },
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  return (
    <Layout className="main-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} className="sider">
        <div className="logo">
          <CreditCardOutlined className="logo-icon" />
          {!collapsed && <span className="logo-text">UCard</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || '管理员'}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content className="content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

