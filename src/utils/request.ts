// API请求工具函数
const API_BASE_URL = 'https://api.ucard.techpulse.pro';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

// API通用响应格式
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

export const request = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { params, ...fetchOptions } = options;

  // 构建URL
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // 设置默认headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 添加token（如果存在）
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 合并自定义headers
  if (fetchOptions.headers) {
    Object.assign(headers, fetchOptions.headers);
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // 处理响应
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || errorData.message || `请求失败: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    // 检查业务状态码
    if (result.code !== 0) {
      throw new Error(result.msg || '请求失败');
    }

    return result.data;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
};

// API响应数据类型定义
interface CaptchaData {
  captchaBase64: string;
  captchaKey: string;
}

interface LoginData {
  token: string;
}

interface UserListData {
  userss: any[];
  total: number;
  page: number;
  limit: number;
}

interface CardListData {
  cards: any[];
  total: number;
  page: number;
  limit: number;
}

interface CardApplyListData {
  cardApplys: any[];
  total: number;
  page: number;
  limit: number;
}

interface AdminListData {
  admins: any[];
  total: number;
  page: number;
  limit: number;
}

interface UserKycListData {
  usersKycs: any[];
  total: number;
  page: number;
  limit: number;
}

interface WalletLogListData {
  walletLogs: any[];
  total: number;
  page: number;
  limit: number;
}

interface WithdrawListData {
  withdraws: any[];
  total: number;
  page: number;
  limit: number;
}

interface DepositListData {
  deposits: any[];
  total: number;
  page: number;
  limit: number;
}

interface ConfigListData {
  configs: any[];
  total: number;
  page: number;
  limit: number;
}

export const api = {
  // 获取验证码
  getCaptcha: () => request<CaptchaData>('/dpi/v1/auth/captcha'),

  // 登录
  login: (data: { username: string; password: string; captchaKey: string; captchaCode: string }) =>
    request<LoginData>('/dpi/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取用户列表
  getUserList: (data: any) => request<UserListData>('/dpi/v1/users/list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 删除用户
  deleteUser: (id: number) => request<{}>(`/dpi/v1/users/${id}`, {
    method: 'DELETE',
  }),

  // 获取卡片列表
  getCardList: (data: any) => request<CardListData>('/dpi/v1/card/list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 获取卡片申请列表
  getCardApplyList: (data: any) => request<CardApplyListData>('/dpi/v1/cardApply/list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 获取管理员列表
  getAdminList: (data: any) => request<AdminListData>('/dpi/v1/admin/list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 获取用户KYC列表
  getUserKycList: (data: any) => request<UserKycListData>('/dpi/v1/usersKyc/list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 获取钱包日志列表
  getWalletLogList: (data: any) => request<WalletLogListData>('/dpi/v1/walletLog/list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 获取提现记录列表
  getWithdrawList: (data: any) => request<WithdrawListData>('/dpi/v1/withdraw/list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 获取充值记录列表
  getDepositList: (data: any) => request<DepositListData>('/dpi/v1/deposit/list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 获取配置列表
  getConfigList: (data: any) => request<ConfigListData>('/dpi/v1/config/list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 新增配置
  createConfig: (data: { key: string; value: string; remark?: string }) =>
    request<{}>('/dpi/v1/config/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新配置
  updateConfig: (id: number, data: { key: string; value: string; remark?: string }) =>
    request<{}>(`/dpi/v1/config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

