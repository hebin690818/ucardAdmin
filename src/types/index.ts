// 用户类型
export interface User {
  id: number;
  email: string;
  name?: string;
  username?: string;
  role?: string;
  status: "active" | "inactive";
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
  exp: string; // 表达式 (如: "like", "eq", "gt" 等)
  logic: string; // 逻辑关系 (如: "and", "or")
  name: string; // 字段名 (如: "name", "email", "status")
  value: string; // 字段值
}

// 用户列表请求参数
export interface UserListRequest {
  columns?: UserQueryColumn[];
  limit: number; // 每页数量
  page: number; // 页码 (从0开始)
  sort: string; // 排序字段
}

// 用户列表响应数据
export interface UserListResponse {
  userss: User[]; // 用户列表
  total: number; // 总数量
  page: number; // 当前页码
  limit: number; // 每页数量
}

// Card类型
export interface Card {
  id: number;
  cardID: string;
  description: string;
  type: string;
  status:
    | "申请中"
    | "制作中"
    | "已发货"
    | "已激活"
    | "注销中"
    | "已注销"
    | "已冻结"
    | "已锁定"
    | "已过期"
    | "等待绑定"
    | "待激活";
  userId: number;
  createdAt: string;
}

// 卡片列表查询条件
export interface CardQueryColumn {
  exp: string; // 表达式 (如: "like", "eq", "gt" 等)
  logic: string; // 逻辑关系 (如: "and", "or")
  name: string; // 字段名 (如: "title", "type", "status")
  value: string; // 字段值
}

// 卡片列表请求参数
export interface CardListRequest {
  columns?: CardQueryColumn[];
  limit: number; // 每页数量
  page: number; // 页码 (从0开始)
  sort: string; // 排序字段
}

// 卡片列表响应数据
export interface CardListResponse {
  cards: Card[]; // 卡片列表
  total: number; // 总数量
  page: number; // 当前页码
  limit: number; // 每页数量
}

// 卡片申请类型
export interface CardApply {
  id: number;
  userId: number;
  cardId: number;
  status: "pending" | "approved" | "rejected";
  applyTime: string;
  reviewTime?: string;
  reviewer?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  // 用户信息字段
  uid?: string;
  userCode?: string;
  email?: string;
  phoneNumber?: number;
  dialCode?: number;
  // 卡片类型
  cardType?: number;
  // 账单地址信息
  billingAddress?: string;
  billingCity?: string;
  billingCountryArea?: string;
  billingPostCode?: number;
  billingCardID?: string;
  // 邮寄地址信息
  postalAddress?: string;
  postalCity?: string;
  postalCountryArea?: string;
  postalPostCode?: number;
  postalFirstName?: string;
  postalLastName?: string;
  postalRecipientTitle?: string;
  postalOrderNo?: string;
}

// 卡片申请列表查询条件
export interface CardApplyQueryColumn {
  exp: string; // 表达式 (如: "like", "eq", "gt" 等)
  logic: string; // 逻辑关系 (如: "and", "or")
  name: string; // 字段名 (如: "status", "userId", "cardId")
  value: string; // 字段值
}

// 卡片申请列表请求参数
export interface CardApplyListRequest {
  columns?: CardApplyQueryColumn[];
  limit: number; // 每页数量
  page: number; // 页码 (从0开始)
  sort: string; // 排序字段
}

// 卡片申请列表响应数据
export interface CardApplyListResponse {
  cardApplys: CardApply[]; // 卡片申请列表
  total: number; // 总数量
  page: number; // 当前页码
  limit: number; // 每页数量
}

// 管理员类型
export interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// 管理员列表查询条件
export interface AdminQueryColumn {
  exp: string; // 表达式 (如: "like", "eq", "gt" 等)
  logic: string; // 逻辑关系 (如: "and", "or")
  name: string; // 字段名 (如: "username", "email", "role", "status")
  value: string; // 字段值
}

// 管理员列表请求参数
export interface AdminListRequest {
  columns?: AdminQueryColumn[];
  limit: number; // 每页数量
  page: number; // 页码 (从0开始)
  sort: string; // 排序字段
}

// 管理员列表响应数据
export interface AdminListResponse {
  admins: Admin[]; // 管理员列表
  total: number; // 总数量
  page: number; // 当前页码
  limit: number; // 每页数量
}

// 用户KYC类型
export interface UserKyc {
  id: number;
  userId: number;
  status: "pending" | "approved" | "rejected";
  documentType: string;
  documentNumber: string;
  fullName: string;
  birthDate: string;
  nationality: string;
  address: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// 用户KYC列表查询条件
export interface UserKycQueryColumn {
  exp: string; // 表达式 (如: "like", "eq", "gt" 等)
  logic: string; // 逻辑关系 (如: "and", "or")
  name: string; // 字段名 (如: "status", "userId", "documentType", "fullName")
  value: string; // 字段值
}

// 用户KYC列表请求参数
export interface UserKycListRequest {
  columns?: UserKycQueryColumn[];
  limit: number; // 每页数量
  page: number; // 页码 (从0开始)
  sort: string; // 排序字段
}

// 用户KYC列表响应数据
export interface UserKycListResponse {
  usersKycs: UserKyc[]; // 用户KYC列表
  total: number; // 总数量
  page: number; // 当前页码
  limit: number; // 每页数量
}

// 登录表单类型
export interface LoginForm {
  username: string;
  password: string;
  captcha: string;
  remember?: boolean;
}

// 提币类型
export interface Withdraw {
  id: number;
  uid: string;
  address: string;
  amount: string;
  toAmount: string;
  fee: string;
  chain: string;
  hash: string;
  status: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// 提币列表查询条件
export interface WithdrawQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "uid", "address", "status")
  value: string;    // 字段值
}

// 提币列表请求参数
export interface WithdrawListRequest {
  columns?: WithdrawQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 提币列表响应数据
export interface WithdrawListResponse {
  withdraws: Withdraw[];  // 提币列表
  total: number;    // 总数量
  page: number;     // 当前页码
  limit: number;    // 每页数量
}

// 认证状态类型
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
