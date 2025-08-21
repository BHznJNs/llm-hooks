---
name: "llm-hooks"
description: "一个面向个人用户的 AI 智能网关，支持多种 LLM 提供商，如 OpenAI、Google 和 Anthropic。"
category: "后端服务"
author: "BHznJNs"
authorUrl: "https://github.com/BHznJNs"
tags: ["TypeScript", "Hono", "LLM", "OpenAI", "Google", "Anthropic", "AI Gateway"]
lastUpdated: "2025-08-20"
---

# llm-hooks

## 项目概述

llm-hooks 是一个面向个人用户的 AI 智能网关，旨在为用户提供一个灵活、可定制的接口来与多种大型语言模型提供商进行交互。该项目支持 OpenAI、Google 和 Anthropic 等主流 LLM 提供商，并可以轻松部署到多种环境中，包括 Docker、Cloudflare Workers 和本地直接运行。

项目通过插件的方式实现 Hook 机制，在请求和响应的不同阶段对数据进行处理。如果没有安装任何插件，则作为一个透明代理。项目还支持配置一个小模型，可以在 Hook 中被调用，用于特定任务。

## 技术栈

- **后端框架**: [Hono](https://hono.dev/) - 轻量级 Web 框架，支持多种运行环境
- **语言**: TypeScript - 提供类型安全和更好的开发体验
- **LLM SDK**: [@ai-sdk/*](https://sdk.vercel.ai/docs) - 用于与各种 LLM 提供商交互的 SDK
- **日志记录**: [pino](https://getpino.io/) - 快速、低开销的日志记录库
- **代码质量**: [biome](https://biomejs.dev/) - 代码格式化和 linting 工具

## 项目结构

```
llm-hooks/
├── src/
│   ├── app.ts              # Hono 应用定义和路由处理
│   ├── index.ts           # 应用入口文件，支持多种部署环境
│   ├── llm-client-factory.ts  # LLM 客户端工厂函数
│   └── types/            # 类型定义
│       ├── index.ts
│       └── openai.ts
├── package.json          # 项目依赖和脚本定义
├── tsconfig.json         # TypeScript 配置
├── biome.jsonc           # 代码质量工具配置
└── README.md             # 项目文档
```

## 开发指南

### 代码风格

- 使用 [biome](https://biomejs.dev/) 进行代码格式化和 linting
- 遵循 TypeScript 最佳实践
- 保持代码整洁和可读性

### 命名约定

- 文件命名使用 kebab-case (短横线分隔)
- 变量和函数命名使用 camelCase (驼峰命名)
- 类型定义使用 PascalCase (帕斯卡命名)

### Git 工作流

- 分支命名遵循功能描述命名，如 `feature/xxx` 或 `fix/xxx`
- 提交信息使用简洁明了的描述
- 通过 Pull Request 进行代码合并

## 环境设置

### 开发要求

- Node.js >= 18.x
- npm 或 yarn 包管理器

### 安装步骤

```bash
# 1. 克隆项目
git clone [repository-url]

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

## 核心功能实现

### LLM 客户端工厂

项目通过 `llmClientFactory` 函数支持多种 LLM 提供商，包括 OpenAI、Google 和 Anthropic。该函数根据传入的提供商类型和 API 密钥创建相应的客户端实例。

```typescript
export function llmClientFactory(
  provider: LlmProvider,
  apiKey: string,
  baseURL?: string
): AnthropicProvider | GoogleGenerativeAIProvider | OpenAIProvider {
  switch (provider) {
    case 'google':
      return createGoogleGenerativeAI({
        apiKey,
        baseURL,
      });
    case 'anthropic':
      return createAnthropic({
        apiKey,
        baseURL,
      });
    case 'openai':
      return createOpenAI({
        apiKey,
        baseURL,
      });
  }
}
```

### API 路由处理

项目使用 Hono 框架定义了基本的 API 路由，包括根路径、模型列表和聊天完成接口。

```typescript
app.get('/', (c) => {
  return c.html('Hello World!');
});

app.get('/v1/models', async (c) => {
  return c.json({ models: [] });
});

app.post('/v1/chat/completions', async (c) => {
  const body = await c.req.json<ChatCompletionRequest>();
  return c.json(body);
});
```

## 测试策略

### 单元测试

- 使用 [Vitest](https://vitest.dev/) 作为测试框架
- 测试覆盖率要求达到 80% 以上
- 测试文件与源文件同目录，以 `.test.ts` 命名

### 集成测试

- 测试不同 LLM 提供商的集成
- 验证 API 路由的响应格式

### 端到端测试

- 使用 [Playwright](https://playwright.dev/) 进行端到端测试
- 测试完整的 API 请求和响应流程

## 部署指南

### 构建过程

```bash
# 构建命令
npm run build
```

### 部署步骤

1. 准备生产环境 (Node.js 或 Cloudflare Workers)
2. 配置环境变量
3. 执行部署脚本
4. 验证部署结果

### 环境变量

```env
# 必要的环境变量
API_KEY=your_api_key_here
BASE_URL=optional_base_url_for_provider
PROVIDER=llm_provider_type (openai, google, anthropic)
```

## 性能优化

### 后端优化

- 使用 Hono 框架以获得高性能和低开销
- 实现缓存策略以减少重复请求
- 优化数据库查询（如果使用数据库）

## 安全考虑

### 数据安全

- 对输入数据进行验证
- 使用 HTTPS 进行安全通信
- 保护 API 密钥等敏感信息

### 认证与授权

- 实现 API 密钥认证机制
- 添加请求频率限制
- 实现用户权限控制

## 监控和日志

### 应用监控

- 使用 pino 进行日志记录
- 集成错误追踪工具（如 Sentry）
- 监控 API 请求和响应时间

### 日志管理

- 日志级别包括：trace, debug, info, warn, error, fatal
- 日志格式为 JSON，便于解析和分析
- 日志存储策略：根据部署环境选择合适的存储方案

## 常见问题

### 问题 1: 如何添加新的 LLM 提供商支持？

**解决方案**: 
1. 在 `llmClientFactory` 函数中添加新的提供商类型
2. 安装相应的 @ai-sdk 包
3. 更新类型定义文件

### 问题 2: 如何在 Cloudflare Workers 中部署？

**解决方案**: 
1. 确保代码符合 Cloudflare Workers 的要求
2. 使用 Wrangler 进行部署
3. 配置环境变量

## 参考资源

- [Hono 官方文档](https://hono.dev/)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [pino 日志库文档](https://getpino.io/#/)

## 功能规划

### Hook 机制

项目计划实现一个灵活的 Hook 机制，允许在请求和响应的不同阶段对数据进行处理。Hook 分为两种类型：

#### Before Request Hook

在发送请求到 LLM 之前执行，可以用于：
- 提示词优化：通过小模型对用户输入的提示词进行优化
- 上下文压缩：在上下文过长时，通过小模型进行摘要和压缩
- 模型 Router：根据任务选择合适的模型

#### After Response Hook

在接收到 LLM 响应后执行，可以用于：
- XML Patcher：修正工具调用指令格式错误问题
- JSON Patcher：对响应的 JSON 数据进行修改
- 自动重试：在响应不符合要求时自动重试

对于 After Response Hook，将支持流式和非流式两种处理方式：
- 流式输出：Hook 直接操作输出的流，返回新的流
- 非流式输出：Hook 操作输出的模型消息，并返回新的消息

### 插件系统

项目将通过插件的方式在 Hook 中处理 LLM 的请求和响应。如果没有安装任何插件，则作为一个透明代理。

### 小模型配置

项目需要配置一个小模型，这个小模型可以在 Hook 中被调用，用于特定任务，例如：
- 根据任务选择合适的模型
- 根据任务选择合适的预设提示词

### 动态插件管理

项目将支持动态添加插件，插件可以声明依赖，在运行时会自动安装对应依赖。
（对于 Cloudflare Workers 场景，由于环境限制，可能不支持动态插件及动态安装依赖特性）

## 更新日志

### v1.0.0 (2025-08-20)

- 初始版本发布
- 实现基本的 LLM API 服务功能
- 支持 OpenAI、Google 和 Anthropic 提供商