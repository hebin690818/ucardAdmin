// 用户类型
export interface User {
  id: number;
  email: string;
  name?: string;
  username?: string;
  role?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  // 新增字段
  uid: string;
  userCode: string;
  phone: number;
  area: string;
  inviteCode: string;
  googleAuth: string;
  password?: string;
  paymentPassword?: string;
  updatedAt: string;
}

// 用户列表查询条件
export interface UserQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "name", "email", "status")
  value: string;    // 字段值
}

// 用户列表请求参数
export interface UserListRequest {
  columns?: UserQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 用户列表响应数据
export interface UserListResponse {
  userss: User[];     // 用户列表
  total: number;    // 总数量
  page: number;     // 当前页码
  limit: number;    // 每页数量
}

// Card类型
export interface Card {
  id: number;
  title: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  userId: number;
  createdAt: string;
}

// 卡片列表查询条件
export interface CardQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "title", "type", "status")
  value: string;    // 字段值
}

// 卡片列表请求参数
export interface CardListRequest {
  columns?: CardQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 卡片列表响应数据
export interface CardListResponse {
  cards: Card[];    // 卡片列表
  total: number;    // 总数量
  page: number;     // 当前页码
  limit: number;    // 每页数量
}

// 卡片申请类型
export interface CardApply {
  id: number;
  userId: number;
  cardId: number;
  status: 'pending' | 'approved' | 'rejected';
  applyTime: string;
  reviewTime?: string;
  reviewer?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 卡片申请列表查询条件
export interface CardApplyQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "status", "userId", "cardId")
  value: string;    // 字段值
}

// 卡片申请列表请求参数
export interface CardApplyListRequest {
  columns?: CardApplyQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 卡片申请列表响应数据
export interface CardApplyListResponse {
  cardApplys: CardApply[];  // 卡片申请列表
  total: number;    // 总数量
  page: number;     // 当前页码
  limit: number;    // 每页数量
}

// 管理员类型
export interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// 管理员列表查询条件
export interface AdminQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "username", "email", "role", "status")
  value: string;    // 字段值
}

// 管理员列表请求参数
export interface AdminListRequest {
  columns?: AdminQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 管理员列表响应数据
export interface AdminListResponse {
  admins: Admin[];  // 管理员列表
  total: number;    // 总数量
  page: number;     // 当前页码
  limit: number;    // 每页数量
}

// 登录表单类型
export interface LoginForm {
  username: string;
  password: string;
  captcha: string;
  remember?: boolean;
}

// 认证状态类型
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

