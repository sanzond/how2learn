# 统一学习系统 - Vite + React + TypeScript 技术手册

## 📋 项目概述

基于 Vite + React + TypeScript 构建的统一学习系统，实现词汇学习和句子理解的双模态学习平台。系统采用 Rescorla-Wagner 学习理论，通过预测误差驱动的学习机制，提供个性化的学习体验。

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
cd unified-learning-react
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🏗️ 项目结构

```
unified-learning-react/
├── public/                          # 静态资源
│   └── unified_learning_data.json   # 学习数据文件
├── src/
│   ├── components/                  # React 组件
│   │   ├── VocabularyLearning.tsx   # 词汇学习组件
│   │   └── SentenceLearning.tsx     # 句子学习组件
│   ├── types.ts                     # TypeScript 类型定义
│   ├── App.tsx                      # 主应用组件
│   ├── main.tsx                     # 应用入口
│   └── index.css                    # 全局样式
├── index.html                       # HTML 模板
├── vite.config.ts                   # Vite 配置
├── tsconfig.json                    # TypeScript 配置
└── package.json                     # 项目配置
```

## 🧠 核心功能

### 1. 词汇学习模式
- **多重线索学习**: 提供语义、语法、语音等多种线索
- **自适应强度调整**: 基于 Rescorla-Wagner 理论的学习强度计算
- **实时进度跟踪**: 显示每个词汇的掌握度和试验次数
- **即时反馈**: 提供正确答案、例句和常见错误提示

### 2. 句子理解模式
- **预测性学习**: 通过认知冲突促进深度理解
- **三阶段学习流程**:
  - 预测阶段：选择答案，制造认知冲突
  - 反馈阶段：查看解释，理解正确答案
  - 语法分析：深入理解句子结构
- **语法结构分析**: 详细的句型模式和成分分解

### 3. 统一数据源
- 词汇学习和句子理解使用同一套数据
- 确保学习内容的一致性和连贯性
- 支持多个学习集合（背痛相关、心理状态等）

## 🔧 技术栈

### 前端框架
- **React 18**: 现代化的用户界面框架
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 快速的构建工具和开发服务器

### UI 和样式
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Lucide React**: 现代化的图标库
- **响应式设计**: 适配各种屏幕尺寸

### 状态管理
- **React Hooks**: useState, useEffect 进行状态管理
- **本地存储**: 学习进度的持久化存储

## 📊 学习算法

### Rescorla-Wagner 理论实现

#### 词汇学习算法
```typescript
const updateVocabularyStrength = (isCorrect: boolean) => {
  const alpha = 0.3;    // 学习率
  const beta = 0.4;     // 关联强度
  const lambda = isCorrect ? currentWord.lambda : 0;
  const V_all = currentWord.totalStrength || 0;
  
  const predictionError = lambda - V_all;
  const deltaV = alpha * beta * predictionError;
  const newStrength = Math.max(0, Math.min(10, V_all + deltaV));
  
  return { predictionError, deltaV, newStrength };
};
```

#### 句子理解算法
```typescript
const updateSentenceStrength = (isCorrect: boolean) => {
  const alpha = 0.35;   // 句子学习率
  const beta = 0.45;    // 句子关联强度
  const lambda = isCorrect ? unit.lambda : 0;
  const V_all = unit.V || 0;
  
  const predictionError = lambda - V_all;
  const deltaV = alpha * beta * predictionError;
  const newV = Math.max(0, Math.min(10, V_all + deltaV));
  
  return { predictionError, deltaV, newV };
};
```

## 📁 数据结构

### 学习数据格式
```typescript
interface LearningData {
  mentalStateSentences: LearningSet;
  backPainSentences: LearningSet;
}

interface LearningSet {
  fullText: string;
  vocabulary: VocabularyItem[];
  sentences: SentenceItem[];
}

interface VocabularyItem {
  word: string;
  translation: string;
  lambda: number;
  example: string;
  commonMistake: string;
  cues: Cue[];
  totalStrength?: number;
  trials?: number;
}

interface SentenceItem {
  title: string;
  sentence: string;
  lambda: number;
  prediction: Prediction;
  grammar: Grammar;
  V?: number;
  trials?: number;
}
```

## 🎨 组件架构

### 主要组件

#### App.tsx
- 应用主组件，管理全局状态
- 处理模式切换和数据加载
- 协调词汇学习和句子学习组件

#### VocabularyLearning.tsx
- 词汇学习界面组件
- 多重线索显示
- 答案输入和反馈展示
- 进度跟踪和导航

#### SentenceLearning.tsx
- 句子理解界面组件
- 预测问题展示
- 三阶段学习流程控制
- 语法分析展示

## 🔄 学习流程

### 词汇学习流程
1. **展示多重线索**: 语义、语法、语音线索
2. **用户输入答案**: 根据线索猜测单词
3. **算法计算强度**: 使用 R-W 理论更新学习强度
4. **反馈展示**: 显示正确答案、例句、常见错误
5. **进度更新**: 更新掌握度和试验次数

### 句子理解流程
1. **预测阶段**: 展示句子和选择题，制造认知冲突
2. **反馈阶段**: 显示正确答案和详细解释
3. **语法分析**: 展示句型模式和语法成分分解
4. **强度更新**: 根据答题结果更新理解强度

## 🚀 部署指南

### 开发环境部署
```bash
# 克隆项目
git clone <repository-url>
cd unified-learning-react

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境部署
```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview

# 部署 dist 目录到服务器
```

### Docker 部署
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 配置说明

### Vite 配置 (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
```

### TypeScript 配置 (tsconfig.json)
- 启用严格模式
- 支持 JSX 语法
- 模块解析配置

## 📈 性能优化

### 代码分割
- 组件懒加载
- 路由级别的代码分割
- 第三方库按需引入

### 缓存策略
- 学习数据缓存
- 静态资源缓存
- 浏览器缓存优化

### 用户体验优化
- 加载状态显示
- 错误边界处理
- 响应式设计

## 🧪 测试

### 单元测试
```bash
# 安装测试依赖
npm install --save-dev @testing-library/react @testing-library/jest-dom

# 运行测试
npm test
```

### 端到端测试
```bash
# 安装 Cypress
npm install --save-dev cypress

# 运行 E2E 测试
npm run cypress:open
```

## 🐛 常见问题

### Q: 数据加载失败
A: 检查 `public/unified_learning_data.json` 文件是否存在且格式正确

### Q: 样式不生效
A: 确认 Tailwind CSS 已正确配置，检查 `index.css` 文件

### Q: TypeScript 编译错误
A: 检查类型定义是否正确，确认 `types.ts` 文件完整

## 📚 学习资源

- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Rescorla-Wagner 学习理论](https://en.wikipedia.org/wiki/Rescorla%E2%80%93Wagner_model)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🎯 项目特色

- ✅ **现代化技术栈**: Vite + React + TypeScript
- ✅ **科学学习理论**: 基于 Rescorla-Wagner 理论
- ✅ **双模态学习**: 词汇记忆 + 句子理解
- ✅ **自适应算法**: 个性化学习强度调整
- ✅ **美观界面**: Tailwind CSS + 响应式设计
- ✅ **类型安全**: 完整的 TypeScript 支持
- ✅ **组件化架构**: 可维护的代码结构