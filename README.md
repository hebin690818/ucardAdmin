# UCard 管理系统

基于 React + TypeScript + Ant Design 的后台管理系统

## 功能特性

- ✨ 邮箱密码登录
- 📊 用户列表管理（增删改查）
- 🎴 Card卡片列表管理（增删改查）
- 🎨 现代化的 UI 设计
- 📱 响应式布局
- 🔐 路由守卫保护

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Ant Design 5** - UI 组件库
- **React Router 6** - 路由管理
- **Vite** - 构建工具

## 快速开始

### 安装依赖

\`\`\`bash
npm install
# 或
yarn install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
# 或
yarn dev
\`\`\`

启动后访问 http://localhost:3000

### 构建生产版本

\`\`\`bash
npm run build
# 或
yarn build
\`\`\`

### 预览生产构建

\`\`\`bash
npm run preview
# 或
yarn preview
\`\`\`

## 登录说明

本系统连接到真实API进行登录验证：

- **API地址**: https://api.ucard.techpulse.pro
- **验证码接口**: `GET /dpi/v1/auth/captcha`
- **登录接口**: `POST /dpi/v1/auth/login`

登录需要：
1. 用户名
2. 密码
3. 图形验证码（自动从服务器获取）

验证码支持点击刷新或使用刷新按钮更新。

## 项目结构

\`\`\`
admin/
├── src/
│   ├── layouts/          # 布局组件
│   │   ├── MainLayout.tsx
│   │   └── MainLayout.css
│   ├── pages/            # 页面组件
│   │   ├── Login.tsx     # 登录页
│   │   ├── Login.css
│   │   ├── UserList.tsx  # 用户列表
│   │   └── CardList.tsx  # 卡片列表
│   ├── types/            # 类型定义
│   │   └── index.ts
│   ├── utils/            # 工具函数
│   │   └── auth.ts       # 认证相关
│   ├── App.tsx           # 根组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
\`\`\`

## 功能模块

### 1. 登录模块

- 用户名密码登录
- 图形验证码验证
- 验证码自动获取和刷新
- 表单验证
- 登录状态持久化（Token + LocalStorage）
- 失败自动刷新验证码

### 2. 用户管理

- 用户列表展示
- 新增用户
- 编辑用户信息
- 删除用户
- 搜索用户

### 3. Card管理

- Card列表展示
- 新增Card
- 编辑Card信息
- 删除Card
- 搜索Card

## 开发说明

### API 集成

登录功能已集成真实API（https://api.ucard.techpulse.pro）：

- ✅ 图形验证码获取（适配 `{ code, data: { captchaBase64, captchaKey }, msg }` 格式）
- ✅ 用户登录认证（自动转换参数格式为 `{ username, password, captchaKey, captchaCode }`）
- ✅ 统一响应格式处理（自动解析 `{ code, data, msg }`）
- ✅ Token管理和自动注入（所有API请求自动添加 `Authorization: Bearer {token}`）
- ✅ 登录返回仅包含token，用户信息由前端构造

其他功能（用户列表、Card列表）当前使用模拟数据，后续需要：

1. 在页面组件中接入真实的数据接口
2. 添加全局状态管理（如 Redux、Zustand 等）
3. 实现数据的增删改查API对接

### 样式定制

项目使用 Ant Design 主题系统，可在 `App.tsx` 中的 `ConfigProvider` 配置主题：

\`\`\`tsx
<ConfigProvider
  locale={zhCN}
  theme={{
    token: {
      colorPrimary: '#1890ff',
      // 更多主题配置...
    },
  }}
>
  {/* ... */}
</ConfigProvider>
\`\`\`

## License

MIT

