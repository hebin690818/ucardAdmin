import type { User } from '../types';
import { api } from './request';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';

export const authUtils = {
  // 保存token
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // 获取token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // 移除token
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // 保存用户信息
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // 获取用户信息
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // 移除用户信息
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // 登出
  logout() {
    this.removeToken();
    this.removeUser();
  },

  // 获取验证码
  async getCaptcha(): Promise<{ captchaId: string; captchaImage: string }> {
    try {
      const data = await api.getCaptcha();
      // 适配API响应格式
      return {
        captchaId: data.captchaKey,
        captchaImage: data.captchaBase64.startsWith('data:') 
          ? data.captchaBase64 
          : `data:image/png;base64,${data.captchaBase64}`,
      };
    } catch (error) {
      throw new Error('获取验证码失败');
    }
  },

  // 真实登录验证
  async login(
    username: string,
    password: string,
    captchaId: string,
    captcha: string
  ): Promise<User> {
    try {
      // 注意：这里的captchaId实际上是captchaKey，captcha是captchaCode
      const response = await api.login({ 
        username, 
        password, 
        captchaKey: captchaId,
        captchaCode: captcha  // 使用captchaCode作为参数名
      });
      
      // 保存token
      this.setToken(response.token);
      
      // 构造用户数据（API只返回token，没有用户信息）
      const user: User = {
        id: 1,
        email: username,
        name: username,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        // 新增必需字段
        uid: 'temp_uid',
        userCode: 'TEMP001',
        phone: 0,
        area: '',
        inviteCode: 'TEMP',
        googleAuth: '',
        updatedAt: new Date().toISOString(),
      };
      
      this.setUser(user);
      return user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '登录失败');
    }
  },
};

