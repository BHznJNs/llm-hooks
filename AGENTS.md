---
name: "llm-hooks"
description: "一个面向个人用户的 AI 智能网关，支持多种 LLM 提供商，如 OpenAI、Google 和 Anthropic。"
category: "后端服务"
author: "BHznJNs"
authorUrl: "https://github.com/BHznJNs"
tags: ["TypeScript", "Hono", "LLM", "OpenAI", "Google", "Anthropic", "AI Gateway"]
lastUpdated: "2025-09-01"
---

# llm-hooks

## 项目概述

llm-hooks 是一个面向个人用户的 AI 智能网关，旨在为用户提供一个灵活、可定制的接口来与多种大型语言模型提供商进行交互。该项目支持 OpenAI、Google 和 Anthropic 等主流 LLM 提供商，并可以轻松部署到多种环境中，包括 Docker 和本地直接运行。

项目通过插件的方式实现 Hook 机制，在请求和响应的不同阶段对数据进行处理。如果没有安装任何插件，则作为一个透明代理。项目还支持配置一个小模型，可以在 Hook 中被调用，用于特定任务。

## 技术栈

### 后端技术栈

- **后端框架**: [Hono](https://hono.dev/) - 轻量级 Web 框架，支持多种运行环境
- **语言**: TypeScript - 提供类型安全和更好的开发体验
- **LLM SDK**: [@ai-sdk/*](https://sdk.vercel.ai/docs) - 用于与各种 LLM 提供商交互的 SDK
- **日志记录**: [pino](https://getpino.io/) - 快速、低开销的日志记录库
- **代码质量**: [biome](https://biomejs.dev/) - 代码格式化和 linting 工具
- **数据库 ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **插件管理**: [live-plugin-manager](https://github.com/sgenoni/live-plugin-manager) - 动态插件管理

### 前端技术栈

- **前端框架**: [React](https://reactjs.org/) - 用于构建用户界面的 JavaScript 库
- **构建工具**: [Vite](https://vitejs.dev/) - 新一代前端构建工具
- **样式框架**: [TailwindCSS](https://tailwindcss.com/) - 用于快速 UI 开发的 CSS 框架
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand) - 轻量级状态管理库
- **路由管理**: [@tanstack/react-router](https://tanstack.com/router) - 类型安全的路由解决方案
- **图标库**: [Lucide React](https://lucide.dev/) - 用于界面图标的 SVG 图标库
- **UI 组件**: [Radix UI](https://www.radix-ui.com/) - 无障碍访问性 UI 组件库

## 项目结构

```
llm-hooks/
├── common/
│   └── types/
│       ├── config.ts          # 配置类型定义
│       ├── hook.ts            # Hook 类型定义
│       ├── index.ts           # 类型导出入口
│       ├── openai.ts          # OpenAI 类型定义
│       ├── plugin.ts          # 插件类型定义
│       └── provider.ts        # LLM 提供商类型定义
├── frontend/                  # 前端项目目录
│   ├── src/
│   │   ├── components/        # React 组件
│   │   ├── lib/               # 工具库
│   │   ├── pages/             # 页面组件
│   │   ├── stores/            # 状态管理
│   │   ├── types/             # 类型定义
│   │   ├── App.tsx            # 根组件
│   │   ├── main.tsx           # 入口文件
│   │   ├── routes.tsx         # 路由配置
│   │   └── index.css          # 全局样式
│   ├── public/                # 静态资源
│   ├── index.html             # HTML 模板
│   ├── package.json           # 前端依赖和脚本定义
│   ├── tsconfig.json          # TypeScript 配置
│   ├── tsconfig.node.json     # Node.js TypeScript 配置
│   ├── vite.config.ts         # Vite 配置
│   └── .env.local             # 前端环境变量
├── src/
│   ├── app.ts                 # Hono 应用定义和路由处理
│   ├── hooks.ts               # Hook 处理器
│   ├── index.ts               # 应用入口文件，支持多种部署环境
│   ├── controllers/           # 控制器层
│   │   ├── app-config.ts      # 应用配置控制器
│   │   ├── plugin-config.ts   # 插件配置控制器
│   │   └── plugin-instance.ts # 插件实例控制器
│   ├── db/
│   │   ├── index.ts           # 数据库连接和导出
│   │   └── schema.ts          # 数据库模式定义
│   ├── openai-routes/         # OpenAI API 路由
│   │   ├── chat-completions.ts # 聊天完成接口
│   │   ├── index.ts           # 路由导出
│   │   └── models.ts          # 模型列表接口
│   ├── routes/                # API 路由
│   │   ├── hooks.ts           # Hook 配置管理
│   │   ├── index.ts           # 路由导出
│   │   ├── plugins.ts         # 插件管理
│   │   └── settings.ts        # 设置管理
│   └── utils/
│       ├── ai-sdk-utils.ts    # AI SDK 工具函数
│       ├── app-data.ts        # 应用数据工具
│       ├── compile.ts         # TypeScript 编译工具
│       ├── field-utils.ts     # 字段处理工具
│       ├── logger.ts          # 日志记录工具
│       ├── llm-client-factory.ts # LLM 客户端工厂函数
│       ├── response-code.ts   # HTTP 响应代码工具
│       ├── runtime.ts         # 运行时环境工具
│       ├── stream-utils.ts    # 流式处理工具
│       └── type-utils.ts      # 类型工具函数
├── drizzle/                   # 数据库迁移文件
├── .gitignore                 # Git 忽略文件
├── Dockerfile                 # Docker 容器配置
├── AGENTS.md                  # 项目代理文档
├── biome.jsonc                # 代码质量工具配置
├── drizzle.config.ts          # 数据库迁移配置
├── package.json               # 项目依赖和脚本定义
├── package-lock.json          # 依赖锁文件
└── tsconfig.json              # TypeScript 配置
```

## 开发指南

### 代码风格

- 使用 [biome](https://biomejs.dev/) 进行代码格式化和 linting
- 遵循 TypeScript 最佳实践
- 保持代码整洁和可读性
- 使用面向对象的设计模式，控制器层负责业务逻辑

#### 前端代码风格

在包含上述代码风格的基础上，还需要遵循以下规则：

- **样式规范**: 使用 TailwindCSS 类名，禁止写 css/scss
- **网络请求**: 统一封装成 hooks，放在 `frontend/src/api/`
- **页面路由**: 在 `frontend/src/pages/` 新增组件即自动成为路由

### 命名约定

- 文件命名使用 kebab-case (短横线分隔)
- 变量和函数命名使用 camelCase (驼峰命名)
- 类型定义使用 PascalCase (帕斯卡命名)
- 类名使用 PascalCase (帕斯卡命名)

### Git 工作流

- 分支命名遵循功能描述命名，如 `feature/xxx` 或 `fix/xxx`
- 提交信息使用简洁明了的描述
- 通过 Pull Request 进行代码合并

## 环境设置

### 开发要求

- Node.js >= 18.x
- TypeScript >= 5.9.2

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/BHznJNs/llm-hooks

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装前端依赖
npm install

# 3. 启动前端开发服务器
npm run dev
```

## 核心功能实现

### 架构设计

项目采用分层架构设计：

1. **控制器层** (`src/controllers/`): 负责业务逻辑处理
   - `AppConfigController`: 应用配置管理
   - `PluginConfigController`: 插件配置管理
   - `PluginInstanceController`: 插件实例管理

2. **路由层** (`src/routes/`, `src/openai-routes/`): 处理 HTTP 请求
   - API 路由统一管理
   - OpenAI 兼容路由分离

3. **工具层** (`src/utils/`): 提供通用工具函数

### 数据持久化

#### 本地运行

直接将应用配置、插件脚本和通过 npm 安装的插件放在用户的数据目录下，在运行时直接通过绝对路径加载配置及插件。

#### Docker 部署

将应用配置、插件脚本持久化到数据库中，在运行时从数据库中读出配置和脚本内容。

### LLM 客户端工厂

项目通过 `llmClientFactory` 函数支持多种 LLM 提供商，包括 OpenAI、Google 和 Anthropic。该函数根据传入的提供商类型和 API 密钥创建相应的客户端实例。

### API 路由处理

项目使用 Hono 框架定义了完整的 API 路由，采用模块化设计：

#### 管理接口 (`/api/`)
- `/api/hooks` - Hook 配置管理
- `/api/plugins` - 插件管理
- `/api/settings` - 系统设置

#### OpenAI 兼容接口 (`/openai/`)
- `/openai/chat/completions` - 聊天完成接口
- `/openai/models` - 模型列表接口

### Hook 机制实现

项目实现了完整的 Hook 处理机制，支持在请求和响应的不同阶段对数据进行处理。支持的 Hook：

- `beforeUpstreamRequest` - 上游请求前处理
- `onUpstreamChunk` - 上游数据流处理
- `afterUpstreamResponse` - 上游响应后处理
- `onFetchModelList` - 模型列表获取处理

### 插件系统

项目支持动态插件加载，插件可以声明依赖，在运行时会自动安装对应依赖。

#### 插件配置类型

```typescript
export type PluginConfig = {
  enabled: boolean;
  dependencies: string[];
  params: Record<string, unknown>;
};
```

#### 控制器架构

- **AppConfigController**: 负责应用配置的加载和保存
- **PluginConfigController**: 负责插件配置的批量管理
- **PluginInstanceController**: 负责插件实例的加载、保存和删除

#### 支持的运行时环境

- Docker 环境
- 本地开发环境

#### 支持的插件类型

- NPM 包插件
- 本地 TypeScript/JavaScript 插件

### 缓存机制

项目实现了插件缓存机制以提高性能：

- 应用配置缓存
- 插件配置缓存
- 插件实例缓存

### 工具函数

项目包含多个实用工具函数：

#### AI SDK 工具 (`src/utils/ai-sdk-utils.ts`)

提供 AI SDK 相关的工具函数，包括请求参数工厂、响应工厂和流式数据编码。

#### 字段处理工具 (`src/utils/field-utils.ts`)

包含认证令牌提取等字段处理函数。

#### 响应代码工具 (`src/utils/response-code.ts`)

定义 HTTP 响应代码常量。

#### 流式处理工具 (`src/utils/stream-utils.ts`)

提供流式响应处理功能，支持数据流转换和处理。

#### TypeScript 编译工具 (`src/utils/compile.ts`)

提供动态 TypeScript 编译功能，用于插件系统。

#### 应用数据管理 (`src/utils/app-data.ts`)

提供跨平台的应用数据路径管理。

## 前端功能实现

### 路由系统

前端使用 [@tanstack/react-router](https://tanstack.com/router) 实现声明式路由管理，目前包含以下页面路由：

- `/` - Hooks 页面
- `/plugins` - 插件管理页面
- `/logs` - 日志页面
- `/settings` - 设置页面

### 状态管理

使用 [Zustand](https://github.com/pmndrs/zustand) 实现全局状态管理，包含：

- Hook 配置状态管理
- 插件状态管理
- 主题状态管理（浅色、深色、系统主题）
- 语言状态管理（中英文切换）

### 国际化

前端支持中英文国际化，通过自定义翻译 Hook 实现：

- 英语 (en)
- 简体中文 (zh)

### 主题系统

支持三种主题模式：

- 浅色模式 (light)
- 深色模式 (dark)
- 系统模式 (system) - 跟随操作系统主题偏好

### UI 组件

#### 侧边栏导航

实现了一个侧边栏导航组件，包含：

- 页面导航链接
- 主题切换图标按钮组（Sun、Moon、Monitor 图标）
- 语言切换下拉框

#### 插件管理界面

- 插件列表显示和编辑
- 拖拽排序支持
- 元数据编辑器
- 脚本编辑器

## 测试策略

项目目前没有添加测试相关的开发依赖和测试脚本。

## 部署指南

### 构建过程

```bash
# 1. 进入前端目录
cd frontend

# 2. 构建前端项目
npm run build
```

TODO: 添加单可执行文件构建流程及 Docker 镜像构建流程

### 部署步骤

1. 准备生产环境 (Node.js)
2. 配置环境变量
3. 执行部署脚本
4. 验证部署结果

### 环境变量

```env
PORT=5126 # 服务器端口（可选）
RUNTIME=docker # Docker 运行环境标识
DATABASE_URL=postgres://username:password@hostname:port/database # 数据库连接 URL，仅在 Docker 环境下需要配置
AUTH_TOKEN=sk-123456 # 用于登录管理页面
```

## 性能优化

### 后端优化

- 使用 Hono 框架以获得高性能和低开销
- 实现插件缓存策略以减少重复加载
- 优化流式响应处理
- 使用内存缓存提高插件加载性能
- 异步插件安装避免阻塞事件循环

### 插件系统优化

- 支持插件预编译和缓存
- 按需加载插件依赖
- 运行时环境适配优化
- 批量配置操作提高效率

## 安全考虑

### 前端鉴权

（这一条未实现）需要在通过鉴权之后才能对项目的配置进行修改。

### 插件安全

- 插件无法直接读取用户的 API Key，防止第三方插件窃取用户数据
- 异步依赖安装避免阻塞系统
- 路径验证防止目录遍历攻击

## 监控和日志

### 应用监控

- 使用 pino 进行日志记录
- 集成错误追踪工具（如 Sentry）
- 监控 API 请求和响应时间
- 插件执行性能监控

### 日志管理

- 日志级别包括：trace, debug, info, warn, error, fatal
- 日志格式为 JSON，便于解析和分析
- 日志存储策略：根据部署环境选择合适的存储方案
- 插件执行日志记录

## 常见问题

### 问题 1: 如何添加新的 LLM 提供商支持？

**解决方案**: 
1. 在 `llmClientFactory` 函数中添加新的提供商类型
2. 安装相应的 @ai-sdk 包
3. 更新类型定义文件
4. 添加相应的配置支持

### 问题 2: 插件编译失败如何处理？

**解决方案**:
1. 检查 TypeScript 语法错误
2. 验证插件依赖是否正确安装
3. 查看编译错误日志
4. 确保运行时环境支持插件编译

### 问题 3: 如何管理插件配置？

**解决方案**:
1. 使用 `PluginConfigController` 管理插件配置
2. 使用 `PluginInstanceController` 管理插件实例
3. 通过 API 接口进行配置管理
4. 支持批量操作和单个操作

## 参考资源

- [Hono 官方文档](https://hono.dev/)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [live-plugin-manager 文档](https://github.com/sgenoni/live-plugin-manager)
