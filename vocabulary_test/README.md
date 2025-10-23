# English Vocabulary Test App

一个基于React的英语词汇测试应用，包含词汇范围测试、语言速度测试和语言反应能力测试。

## 功能特性

- **词汇范围测试**：60道词汇选择题，测试词汇量
- **语言速度测试**：2部分计时测试，测试快速思考能力
- **语言反应能力测试**：同义词和反义词识别测试
- **成绩统计**：自动计算分数并显示等级评价
- **响应式设计**：支持各种屏幕尺寸

## 技术栈

- React 18
- Vite (构建工具)
- Tailwind CSS (样式框架)
- Lucide React (图标库)

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 项目结构

```
vocabulary_test/
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # 应用入口点
│   └── index.css        # 全局样式
├── index.html           # HTML模板
├── package.json         # 项目配置
├── vite.config.js       # Vite配置
├── tailwind.config.js   # Tailwind配置
└── postcss.config.js    # PostCSS配置
```

## 测试说明

### 词汇范围测试 (Vocabulary Range)
- 60道选择题
- 每题5个选项
- 测试时间约15分钟
- 评分标准：
  - ≤11分：低于平均水平
  - 12-35分：平均水平
  - 36-48分：高于平均水平
  - 49-54分：优秀
  - ≥55分：卓越

### 语言速度测试 (Verbal Speed)
- 第1部分：2分钟完成30题
- 第2部分：3分钟完成不同题型
- 测试单词关系：同义词(S)、反义词(O)、不同(D)

### 语言反应能力测试 (Verbal Responsiveness)
- 同义词和反义词识别
- 测试语言反应速度

## 开发说明

项目使用现代React开发模式，支持热重载和快速开发。样式使用Tailwind CSS，图标使用Lucide React。

## 许可证

MIT License