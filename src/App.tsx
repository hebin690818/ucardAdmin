import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import UserList from './pages/UserList';
import CardList from './pages/CardList';
import CardApplyList from './pages/CardApplyList';
import UserKycList from './pages/UserKycList';
import AdminList from './pages/AdminList';
import { authUtils } from './utils/auth';

// 路由守卫组件
const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthenticated = authUtils.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/users" replace />} />
            <Route path="users" element={<UserList />} />
            <Route path="cards" element={<CardList />} />
            <Route path="card-applys" element={<CardApplyList />} />
            <Route path="user-kycs" element={<UserKycList />} />
            <Route path="admins" element={<AdminList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;

