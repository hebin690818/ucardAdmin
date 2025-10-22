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

// 卡片状态类型
export type CardStatus = 
  | '1'  // 申请中
  | '2'  // 制作中
  | '3'  // 已发货
  | '4'  // 已激活
  | '5'  // 注销中
  | '6'  // 已注销
  | '7'  // 已冻结
  | '8'  // 已锁定
  | '9'  // 已过期
  | '10' // 等待绑定
  | '11'; // 待激活

// 卡片状态映射
export const CARD_STATUS_MAP: Record<CardStatus, string> = {
  '1': '申请中',
  '2': '制作中',
  '3': '已发货',
  '4': '已激活',
  '5': '注销中',
  '6': '已注销',
  '7': '已冻结',
  '8': '已锁定',
  '9': '已过期',
  '10': '等待绑定',
  '11': '待激活'
};

// 卡片状态选项（用于下拉选择等）
export const CARD_STATUS_OPTIONS = Object.entries(CARD_STATUS_MAP).map(([value, label]) => ({
  value: value as CardStatus,
  label
}));

// Card类型
export interface Card {
  id: number;
  cardID: string;
  description: string;
  type: string;
  status: CardStatus;
  userId: number;
  createdAt: string;
}

// 卡片列表查询条件
export interface CardQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "cardID", "type", "status")
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
  uid: string;                    // 用户ID
  userCode: string;               // 用户代码
  billingCardID: string;          // 账单卡片ID
  cardType: number;              // 卡片类型
  phoneNumber: number;            // 电话号码
  dialCode: number;              // 区号
  email: string;                 // 邮箱
  billingAddress: string;         // 账单地址
  billingCity: string;           // 账单城市
  billingCountryArea: string;    // 账单国家/地区
  billingPostCode: number;       // 账单邮编
  postalAddress: string;         // 邮寄地址
  postalCity: string;            // 邮寄城市
  postalCountryArea: string;     // 邮寄国家/地区
  postalPostCode: number;        // 邮寄邮编
  postalFirstName: string;       // 邮寄名字
  postalLastName: string;        // 邮寄姓氏
  postalProvince: string;        // 邮寄省份
  postalRecipientTitle: string;  // 邮寄收件人称呼
  postalOrderNo: string;         // 邮寄订单号
  status: 'pending' | 'approved' | 'rejected';
  applyTime?: string;
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

// 用户KYC类型
export interface UserKyc {
  id: number;
  account_id: string;
  birthday: string;
  countryArea: string;
  createdAt: string;
  destination: string;
  firstNameEn: string;
  identityBackPicURL: string;
  identityCard: string;
  identityCardType: number;
  identityCardValidityTime: string;
  identityFrontPicURL: string;
  issueDate: string;
  lastNameEn: string;
  permitNumber: string;
  transaction_id: string;
  uid: string;
  updatedAt: string;
  usercode: string;
  validUntil: string;
}

// 用户KYC列表查询条件
export interface UserKycQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "status", "userId", "documentType", "fullName")
  value: string;    // 字段值
}

// 用户KYC列表请求参数
export interface UserKycListRequest {
  columns?: UserKycQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 用户KYC列表响应数据
export interface UserKycListResponse {
  usersKycs: UserKyc[];  // 用户KYC列表
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

// 钱包日志类型
export interface WalletLog {
  afterAmount: string;    // 交易后金额
  amount: string;         // 交易金额
  beforeAmount: string;   // 交易前金额
  createdAt: string;      // 创建时间
  logType: string;        // 日志类型
  otherID: string;        // 其他ID
  uid: string;           // 用户ID
}

// 钱包日志查询条件
export interface WalletLogQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "uid", "logType", "amount")
  value: string;    // 字段值
}

// 钱包日志列表请求参数
export interface WalletLogListRequest {
  columns?: WalletLogQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 钱包日志列表响应数据
export interface WalletLogListResponse {
  walletLogs: WalletLog[];  // 钱包日志列表
  total: number;    // 总数量
  page: number;     // 当前页码
  limit: number;    // 每页数量
}

// 提现记录类型
export interface Withdraw {
  id: number;           // 提现记录ID
  uid: string;          // 用户ID
  address: string;      // 提现地址
  amount: string;        // 提现金额
  toAmount: string;     // 实际到账金额
  fee: string;          // 手续费
  chain: string;        // 区块链名称
  hash: string;         // 交易哈希
  status: number;       // 提现状态
  errorMessage: string; // 错误信息
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}

// 提现记录查询条件
export interface WithdrawQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "uid", "status", "address")
  value: string;    // 字段值
}

// 提现记录列表请求参数
export interface WithdrawListRequest {
  columns?: WithdrawQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 提现记录列表响应数据
export interface WithdrawListResponse {
  withdraws: Withdraw[];  // 提现记录列表
  total: number;    // 总数量
  page: number;     // 当前页码
  limit: number;    // 每页数量
}

// 充值记录类型
export interface Deposit {
  id: number;           // 充值记录ID
  blockNumber: number;   // 区块号
  chain: string;         // 区块链名称
  contract: string;      // 合约地址
  from: string;          // 发送方地址
  to: string;            // 接收方地址
  hash: string;          // 交易哈希
  createdAt: string;     // 创建时间
  updatedAt: string;     // 更新时间
}

// 充值记录查询条件
export interface DepositQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "chain", "from", "to", "hash")
  value: string;    // 字段值
}

// 充值记录列表请求参数
export interface DepositListRequest {
  columns?: DepositQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 充值记录列表响应数据
export interface DepositListResponse {
  deposits: Deposit[];  // 充值记录列表
  total: number;    // 总数量
  page: number;     // 当前页码
  limit: number;    // 每页数量
}

// 配置类型
export interface Config {
  id: number;           // 配置ID
  key: string;           // 配置键
  value: string;         // 配置值
  remark: string;        // 备注
  createdAt: string;     // 创建时间
  updatedAt: string;     // 更新时间
}

// 配置查询条件
export interface ConfigQueryColumn {
  exp: string;      // 表达式 (如: "like", "eq", "gt" 等)
  logic: string;    // 逻辑关系 (如: "and", "or")
  name: string;     // 字段名 (如: "key", "value", "remark")
  value: string;    // 字段值
}

// 配置列表请求参数
export interface ConfigListRequest {
  columns?: ConfigQueryColumn[];
  limit: number;    // 每页数量
  page: number;     // 页码 (从0开始)
  sort: string;     // 排序字段
}

// 配置列表响应数据
export interface ConfigListResponse {
  configs: Config[];  // 配置列表
  total: number;    // 总数量
  page: number;     // 当前页码
  limit: number;    // 每页数量
}

// 认证状态类型
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

