# 统一学习系统 - 部署运行技术手册

## 🚀 快速部署指南

### 前置条件
- **操作系统**: Windows 11 Pro
- **Shell**: PowerShell 7
- **Node.js**: >= 16.0.0
- **npm**: >= 7.0.0

### 1. 项目结构检查
确保以下文件结构完整：
```
unified-learning-react/
├── public/
│   └── unified_learning_data.json    # ✅ 学习数据文件
├── src/
│   ├── components/
│   │   ├── VocabularyLearning.tsx    # ✅ 词汇学习组件
│   │   └── SentenceLearning.tsx      # ✅ 句子学习组件
│   ├── App.tsx                       # ✅ 主应用组件
│   ├── main.tsx                      # ✅ 应用入口
│   ├── types.ts                      # ✅ 类型定义
│   └── index.css                     # ✅ 样式文件
├── index.html                        # ✅ HTML 模板
├── package.json                      # ✅ 项目配置
├── vite.config.ts                    # ✅ Vite 配置
└── tsconfig.json                     # ✅ TypeScript 配置
```

### 2. 依赖安装与验证
```powershell
# 进入项目目录
cd n:\sourceproject\How2learn\unified-learning-react

# 验证 Node.js 版本
node --version
# 应显示: v16.x.x 或更高

# 验证 npm 版本
npm --version
# 应显示: 7.x.x 或更高

# 检查已安装的依赖
npm list --depth=0

# 如果依赖缺失，重新安装
npm install
```

### 3. 开发环境启动
```powershell
# 启动开发服务器
npm run dev

# 预期输出:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

**访问应用**: 
- 本地访问: http://localhost:3000
- 网络访问: http://[your-ip]:3000 (需要添加 --host 参数)

### 4. 功能测试清单

#### 4.1 基础功能测试
- [ ] **页面加载**: 首页正常显示，无控制台错误
- [ ] **数据加载**: "正在加载学习数据..." 消失，内容正常显示
- [ ] **模式切换**: 词汇学习 ↔ 句子理解模式切换正常
- [ ] **内容切换**: 背痛相关内容 ↔ 心理状态内容切换正常

#### 4.2 词汇学习模式测试
- [ ] **多重线索显示**: 语义、语法、语音线索正常显示
- [ ] **答案输入**: 输入框响应正常，支持回车提交
- [ ] **答案验证**: 正确/错误答案判断准确
- [ ] **进度更新**: 掌握度进度条实时更新
- [ ] **反馈显示**: 正确答案、例句、常见错误显示完整
- [ ] **导航功能**: 上一个/下一个按钮工作正常

#### 4.3 句子理解模式测试
- [ ] **句子显示**: 完整句子和标题正确显示
- [ ] **选项选择**: 单选按钮响应正常，样式变化明显
- [ ] **预测阶段**: 问题和选项显示完整，提交按钮可用
- [ ] **反馈阶段**: 正确/错误反馈显示，解释内容完整
- [ ] **语法分析**: 句型模式和成分分解显示详细
- [ ] **进度跟踪**: 句子掌握度更新正确

#### 4.4 算法验证测试
- [ ] **R-W 算法**: 学习强度计算正确
- [ ] **预测误差**: 误差计算和显示准确
- [ ] **强度更新**: 新强度值计算合理
- [ ] **试验计数**: 试验次数正确累加

### 5. 生产环境构建
```powershell
# 构建生产版本
npm run build

# 预期输出:
# vite v4.x.x building for production...
# ✓ xx modules transformed.
# dist/index.html                  x.xx kB
# dist/assets/index-xxxxxxxx.js    xxx.xx kB | gzip: xx.xx kB
# ✓ built in xxxms

# 预览构建结果
npm run preview

# 预期输出:
# ➜  Local:   http://localhost:4173/
# ➜  Network: use --host to expose
```

### 6. 性能优化验证
```powershell
# 分析构建包大小
npm run build -- --analyze

# 检查构建产物
ls dist/
# 应包含: index.html, assets/ 目录
```

### 7. 常见问题排查

#### 7.1 启动失败
**问题**: `npm run dev` 失败
**排查步骤**:
```powershell
# 1. 检查 Node.js 版本
node --version

# 2. 清理缓存
npm cache clean --force

# 3. 删除 node_modules 重新安装
Remove-Item -Recurse -Force node_modules
npm install

# 4. 检查端口占用
netstat -ano | findstr :3000
```

#### 7.2 数据加载失败
**问题**: 显示"正在加载学习数据..."不消失
**排查步骤**:
```powershell
# 1. 检查数据文件
ls public/unified_learning_data.json

# 2. 验证 JSON 格式
Get-Content public/unified_learning_data.json | ConvertFrom-Json

# 3. 检查浏览器控制台错误
# 打开开发者工具 -> Console 查看报错信息
```

#### 7.3 样式问题
**问题**: 页面样式异常
**解决方案**:
```powershell
# 1. 检查 Tailwind CSS 加载
# 确认 index.css 中包含 @tailwind 指令

# 2. 验证 CDN 连接
# 确认网络连接正常，Tailwind CDN 可访问
```

#### 7.4 TypeScript 错误
**问题**: 编译时 TypeScript 报错
**解决方案**:
```powershell
# 1. 检查类型定义
Get-Content src/types.ts

# 2. 验证组件导入
# 确认所有组件正确导入和导出

# 3. 重新编译
npm run build
```

### 8. 部署到生产环境

#### 8.1 静态文件服务器部署
```powershell
# 1. 构建项目
npm run build

# 2. 部署 dist 目录到 Web 服务器
# 例如: IIS, Apache, Nginx

# 3. 配置服务器支持 SPA 路由
# 确保所有路由都指向 index.html
```

#### 8.2 Docker 部署
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```powershell
# 构建 Docker 镜像
docker build -t unified-learning-system .

# 运行容器
docker run -p 80:80 unified-learning-system
```

### 9. 监控和维护

#### 9.1 性能监控
- **加载时间**: 首屏加载 < 3秒
- **交互响应**: 点击响应 < 100ms
- **内存使用**: 浏览器内存占用合理

#### 9.2 错误监控
- **JavaScript 错误**: 控制台无报错
- **网络请求**: API 请求成功率 > 99%
- **用户体验**: 功能操作流畅

#### 9.3 定期维护
```powershell
# 更新依赖
npm update

# 安全审计
npm audit

# 修复安全漏洞
npm audit fix
```

### 10. 技术支持

#### 10.1 日志收集
```powershell
# 开发环境日志
# 浏览器开发者工具 -> Console

# 生产环境日志
# 配置日志收集服务 (如 Sentry)
```

#### 10.2 问题反馈
- **GitHub Issues**: 技术问题和功能建议
- **文档更新**: 及时更新部署文档
- **版本管理**: 使用语义化版本控制

---

## ✅ 部署成功标志

当以下检查项全部通过时，表示部署成功：

1. ✅ **应用启动**: 无报错，端口监听正常
2. ✅ **页面加载**: 首页完整渲染，加载动画消失
3. ✅ **功能完整**: 词汇学习和句子理解模式都能正常使用
4. ✅ **数据正确**: 学习数据加载成功，内容显示准确
5. ✅ **交互响应**: 所有按钮和输入框响应正常
6. ✅ **算法运行**: 学习强度计算和更新正确
7. ✅ **样式正常**: 界面美观，布局合理
8. ✅ **性能良好**: 操作流畅，无明显卡顿

## 📞 技术支持联系

如遇到部署问题，请提供以下信息：
- 操作系统版本
- Node.js 和 npm 版本
- 错误信息截图
- 控制台报错日志
- 具体操作步骤

---
**最后更新**: 2025年10月10日
**文档版本**: v1.0.0