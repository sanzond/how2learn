# TSX程序部署运行技术手册

## 📋 项目概述

本手册详细说明如何部署和运行两个基于React + TypeScript的学习应用：
- **rw_back_pain_vocab.tsx** - Rescorla-Wagner词汇学习系统
- **rw_back_pain_sentence.tsx** - Rescorla-Wagner句子理解学习系统

## 🏗️ 技术栈

- **前端框架**: React 18 + TypeScript
- **样式框架**: Tailwind CSS
- **图标库**: Lucide React
- **数据格式**: JSON
- **构建工具**: Vite / Create React App / Next.js

## 📦 项目文件结构

```
How2learn/
├── src/
│   ├── components/
│   │   ├── rw_back_pain_vocab.tsx
│   │   └── rw_back_pain_sentence.tsx
│   └── data/
│       ├── back_pain_vocabulary.json
│       └── back_pain_sentence_units.json
├── public/
│   ├── back_pain_vocabulary.json
│   └── back_pain_sentence_units.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🚀 部署方案

### 方案一：使用 Vite + React (推荐)

#### 1. 初始化项目

```bash
# 创建新的React + TypeScript项目
npm create vite@latest how2learn-app -- --template react-ts
cd how2learn-app

# 安装依赖
npm install
```

#### 2. 安装必要依赖

```bash
# 安装UI和图标库
npm install lucide-react

# 安装Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 3. 配置Tailwind CSS

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 4. 项目文件配置

**src/App.tsx**:
```tsx
import React, { useState } from 'react';
import BackPainVocabulary from './components/BackPainVocabulary';
import BackPainSentenceLearning from './components/BackPainSentenceLearning';
import './App.css';

function App() {
  const [currentApp, setCurrentApp] = useState<'vocab' | 'sentence'>('vocab');

  return (
    <div className="App">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">R-W学习系统</h1>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentApp('vocab')}
              className={`px-4 py-2 rounded ${
                currentApp === 'vocab' 
                  ? 'bg-blue-800' 
                  : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              词汇学习
            </button>
            <button
              onClick={() => setCurrentApp('sentence')}
              className={`px-4 py-2 rounded ${
                currentApp === 'sentence' 
                  ? 'bg-blue-800' 
                  : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              句子理解
            </button>
          </div>
        </div>
      </nav>
      
      {currentApp === 'vocab' && <BackPainVocabulary />}
      {currentApp === 'sentence' && <BackPainSentenceLearning />}
    </div>
  );
}

export default App;
```

#### 5. 复制组件和数据文件

```bash
# 复制tsx组件到src/components/
cp rw_back_pain_vocab.tsx src/components/BackPainVocabulary.tsx
cp rw_back_pain_sentence.tsx src/components/BackPainSentenceLearning.tsx

# 复制JSON数据到public/目录
cp back_pain_vocabulary.json public/
cp back_pain_sentence_units.json public/
```

#### 6. 运行开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`

#### 7. 构建生产版本

```bash
npm run build
npm run preview
```

### 方案二：使用 Next.js

#### 1. 创建Next.js项目

```bash
npx create-next-app@latest how2learn-nextjs --typescript --tailwind --eslint
cd how2learn-nextjs
```

#### 2. 安装依赖

```bash
npm install lucide-react
```

#### 3. 项目结构

```
how2learn-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── BackPainVocabulary.tsx
│   │   └── BackPainSentenceLearning.tsx
│   └── data/
│       ├── back_pain_vocabulary.json
│       └── back_pain_sentence_units.json
└── public/
    ├── back_pain_vocabulary.json
    └── back_pain_sentence_units.json
```

#### 4. 运行和构建

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build
npm start
```

### 方案三：使用 Create React App

#### 1. 创建CRA项目

```bash
npx create-react-app how2learn-cra --template typescript
cd how2learn-cra
```

#### 2. 安装依赖

```bash
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 3. 配置和运行

```bash
# 开发模式
npm start

# 构建生产版本
npm run build
```

## 🔧 配置详解

### TypeScript配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Package.json示例

```json
{
  "name": "how2learn-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

## 🌐 部署到生产环境

### 1. 静态网站部署

#### Vercel部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel

# 生产部署
vercel --prod
```

#### Netlify部署
```bash
# 构建项目
npm run build

# 上传dist文件夹到Netlify
# 或使用Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages部署
```bash
# 安装gh-pages
npm install --save-dev gh-pages

# 添加到package.json scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# 部署
npm run deploy
```

### 2. 服务器部署 (Nginx)

#### Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/how2learn;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Docker部署

#### Dockerfile
```dockerfile
# 构建阶段
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  how2learn-app:
    build: .
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: unless-stopped
```

## 🔍 故障排除

### 常见问题及解决方案

#### 1. JSON文件加载失败
```
错误: Failed to fetch ./back_pain_vocabulary.json
解决: 确保JSON文件在public目录下，通过HTTP服务器访问
```

#### 2. TypeScript编译错误
```
错误: 找不到模块"react"或其相应的类型声明
解决: npm install @types/react @types/react-dom
```

#### 3. Tailwind样式不生效
```
错误: 样式没有应用
解决: 检查tailwind.config.js的content配置，确保包含所有TSX文件
```

#### 4. 路由问题 (SPA)
```
错误: 刷新页面404
解决: 配置服务器重定向所有请求到index.html
```

### 调试技巧

#### 1. 开发工具
```bash
# 启用详细日志
npm run dev -- --verbose

# TypeScript类型检查
npx tsc --noEmit

# ESLint检查
npm run lint
```

#### 2. 网络调试
```javascript
// 添加网络请求日志
const response = await fetch('./back_pain_vocabulary.json');
console.log('Response status:', response.status);
console.log('Response headers:', response.headers);
```

## 📊 性能优化

### 1. 代码分割
```typescript
// 使用React.lazy进行组件懒加载
const BackPainVocabulary = React.lazy(() => import('./components/BackPainVocabulary'));
const BackPainSentenceLearning = React.lazy(() => import('./components/BackPainSentenceLearning'));

// 使用Suspense
<Suspense fallback={<div>Loading...</div>}>
  <BackPainVocabulary />
</Suspense>
```

### 2. 数据预加载
```typescript
// 预加载JSON数据
useEffect(() => {
  // 预加载两个JSON文件
  Promise.all([
    fetch('./back_pain_vocabulary.json'),
    fetch('./back_pain_sentence_units.json')
  ]).then(responses => {
    // 处理预加载的数据
  });
}, []);
```

### 3. 缓存策略
```typescript
// 使用localStorage缓存数据
const cacheKey = 'vocabulary_data_v1';
const cachedData = localStorage.getItem(cacheKey);

if (cachedData) {
  setVocabulary(JSON.parse(cachedData));
} else {
  // 从服务器加载并缓存
  fetch('./back_pain_vocabulary.json')
    .then(response => response.json())
    .then(data => {
      setVocabulary(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    });
}
```

## 🔐 安全考虑

### 1. 数据验证
```typescript
// 验证JSON数据结构
const validateVocabularyData = (data: any[]): boolean => {
  return data.every(item => 
    item.word && 
    item.translation && 
    Array.isArray(item.cues) &&
    typeof item.lambda === 'number'
  );
};
```

### 2. 错误边界
```typescript
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## 📈 监控和分析

### 1. 性能监控
```typescript
// 添加性能监控
const startTime = performance.now();
// ... 执行操作
const endTime = performance.now();
console.log(`操作耗时: ${endTime - startTime} 毫秒`);
```

### 2. 用户分析
```typescript
// 简单的用户行为跟踪
const trackUserAction = (action: string, data?: any) => {
  console.log('User action:', action, data);
  // 发送到分析服务
};
```

## 📝 总结

本技术手册提供了完整的TSX程序部署方案：

1. **开发环境**: Vite + React + TypeScript (推荐)
2. **生产部署**: 支持Vercel、Netlify、GitHub Pages等
3. **服务器部署**: Nginx + Docker配置
4. **性能优化**: 代码分割、缓存策略
5. **故障排除**: 常见问题解决方案

选择适合您需求的部署方案，按照步骤操作即可成功运行R-W学习系统！