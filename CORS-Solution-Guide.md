# CORS跨域问题完整解决方案

## 📋 问题分析

### 错误信息
```
Access to fetch at 'http://127.0.0.1:18080/api/learning/data' from origin 'http://localhost:3000' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header contains multiple values '*, *', but only one is allowed.
```

### 问题根因
1. **跨域访问**：前端(`localhost:3000`) 访问后端(`127.0.0.1:18080`)
2. **CORS头部重复**：服务器返回了重复的 `Access-Control-Allow-Origin: *, *`
3. **协议/端口不匹配**：不同的主机名和端口被浏览器视为不同源

---

## 🎯 解决方案1：后端CORS配置修复（推荐）

### Python Flask/Django 后端修复

#### Flask 解决方案
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# 方式1：简单配置（开发环境）
CORS(app, origins=['http://localhost:3000'])

# 方式2：详细配置（生产环境推荐）
CORS(app, 
     origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
     methods=['GET', 'POST', 'PUT', 'DELETE'],
     allow_headers=['Content-Type', 'Authorization']
)

@app.route('/api/learning/data', methods=['GET'])
def get_learning_data():
    # 手动设置CORS头部（如果CORS库不工作）
    response = make_response(jsonify(your_data))
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response
```

#### Django 解决方案
```python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    # ...
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ...
]

# CORS配置
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# 或者开发环境允许所有（不推荐生产环境）
CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### Node.js Express 后端修复
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// 方式1：简单配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
}));

// 方式2：详细配置
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 手动设置CORS头部
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

---

## 🔧 解决方案2：前端代理配置

### Vite 代理配置
创建或修改 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:18080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

### 修改前端配置文件
```typescript
// src/config.ts
export interface AppConfig {
  dataSource: 'local' | 'network';
  networkUrl: string;
  localPath: string;
}

export const config: AppConfig = {
  dataSource: 'network',
  // 使用相对路径，通过代理访问
  networkUrl: '/api/learning/data',
  localPath: './unified_learning_data.json'
};
```

### Create React App 代理配置
如果使用 Create React App，在 `package.json` 中添加：

```json
{
  "name": "your-app",
  "version": "0.1.0",
  "proxy": "http://127.0.0.1:18080",
  "dependencies": {
    // ...
  }
}
```

---

## 🛠️ 解决方案3：开发环境配置

### 方案A：修改hosts文件
将 `127.0.0.1` 统一为 `localhost`：

**Windows**: `C:\Windows\System32\drivers\etc\hosts`
**Mac/Linux**: `/etc/hosts`

```
127.0.0.1 localhost
```

然后修改配置：
```typescript
// src/config.ts
export const config: AppConfig = {
  dataSource: 'network',
  networkUrl: 'http://localhost:18080/api/learning/data', // 统一使用localhost
  localPath: './unified_learning_data.json'
};
```

### 方案B：Chrome 禁用安全策略（仅开发）
启动Chrome时添加参数：
```bash
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security --disable-features=VizDisplayCompositor
```

**⚠️ 警告：仅用于开发环境，不要在生产环境使用！**

---

## 💻 解决方案4：代码层面处理

### 增强的前端请求处理
修改 `src/App.tsx` 中的数据加载逻辑：

```typescript
// 加载JSON数据
useEffect(() => {
  const loadLearningData = async () => {
    try {
      let response: Response;
      
      if (config.dataSource === 'network') {
        console.log('从网络加载数据:', config.networkUrl);
        
        // 尝试多种请求方式
        try {
          // 方式1：正常请求
          response = await fetch(config.networkUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors', // 明确指定CORS模式
          });
        } catch (corsError) {
          console.warn('CORS请求失败，尝试no-cors模式:', corsError);
          
          // 方式2：no-cors模式（注意：这种模式下无法读取响应内容）
          response = await fetch(config.networkUrl, {
            method: 'GET',
            mode: 'no-cors',
          });
          
          // no-cors模式下response.ok始终为false，需要特殊处理
          if (response.type === 'opaque') {
            throw new Error('no-cors模式无法读取响应内容，请修复服务器CORS配置');
          }
        }
      } else {
        console.log('从本地加载数据:', config.localPath);
        response = await fetch(config.localPath);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LearningData = await response.json();
      setLearningData(data);
      console.log('数据加载成功:', config.dataSource === 'network' ? '网络源' : '本地源');
      
    } catch (error) {
      console.error(`从${config.dataSource === 'network' ? '网络' : '本地'}加载学习数据失败:`, error);
      
      // 智能后备策略
      if (config.dataSource === 'network') {
        try {
          console.log('网络加载失败，尝试从本地加载后备数据...');
          const fallbackResponse = await fetch(config.localPath);
          if (!fallbackResponse.ok) {
            throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
          }
          const fallbackData: LearningData = await fallbackResponse.json();
          setLearningData(fallbackData);
          console.log('后备数据加载成功');
        } catch (fallbackError) {
          console.error('后备数据加载也失败:', fallbackError);
          setLearningData({});
        }
      } else {
        setLearningData({});
      }
    }
  };

  loadLearningData();
}, []);
```

### 添加重试机制
```typescript
// 工具函数：带重试的fetch
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`请求失败，第${i + 1}次重试...`, error);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 递增延迟
    }
  }
  throw new Error('所有重试都失败了');
};
```

---

## 🚀 解决方案5：生产环境部署

### Nginx 反向代理配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/your/react/build;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:18080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS头部
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # 预检请求处理
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
}
```

### Docker Compose 配置
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "18080:18080"
    environment:
      - CORS_ORIGIN=http://localhost:3000

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
```

---

## 📋 快速修复检查清单

### 立即可尝试的解决方案（按优先级排序）

#### ✅ 高优先级（推荐）
1. **修复后端CORS配置**
   - [ ] 检查服务器CORS中间件配置
   - [ ] 确保只返回一个 `Access-Control-Allow-Origin` 头部
   - [ ] 添加 `localhost:3000` 到允许的源列表

2. **配置Vite代理**
   - [ ] 创建 `vite.config.ts` 代理配置
   - [ ] 修改 `config.ts` 使用相对路径 `/api/learning/data`
   - [ ] 重启开发服务器

#### ⚡ 中优先级
3. **统一主机名**
   - [ ] 将后端URL改为 `http://localhost:18080/api/learning/data`
   - [ ] 或将前端访问 `http://127.0.0.1:3000`

4. **添加请求头**
   - [ ] 在fetch请求中明确设置 `mode: 'cors'`
   - [ ] 添加必要的请求头

#### 🔧 低优先级（应急方案）
5. **开发环境临时方案**
   - [ ] 浏览器禁用安全策略（仅开发）
   - [ ] 使用 `mode: 'no-cors'`（功能受限）

---

## 🎯 最佳实践建议

### 开发环境
1. **使用代理**：推荐使用Vite代理，避免CORS问题
2. **统一域名**：开发时使用相同的主机名（都用localhost或127.0.0.1）
3. **环境变量**：使用环境变量管理不同环境的API地址

### 生产环境
1. **同域部署**：前后端部署在同一域名下
2. **反向代理**：使用Nginx等反向代理统一入口
3. **HTTPS**：生产环境使用HTTPS协议

### 代码层面
1. **错误处理**：完善的错误处理和用户提示
2. **后备方案**：网络请求失败时的后备数据源
3. **重试机制**：网络不稳定时的自动重试

---

## 🔍 调试技巧

### Chrome DevTools 检查
1. **Network标签**：查看请求状态和响应头
2. **Console标签**：查看CORS错误详细信息
3. **Application标签**：检查本地存储和缓存

### 常用调试命令
```bash
# 检查端口占用
netstat -ano | findstr :18080

# 测试API可访问性
curl -X GET http://127.0.0.1:18080/api/learning/data

# 检查响应头
curl -I http://127.0.0.1:18080/api/learning/data
```

---

## 📞 问题排查流程

1. **确认服务状态**
   - [ ] 后端服务是否正常运行
   - [ ] API端点是否可访问
   - [ ] 返回数据格式是否正确

2. **检查CORS配置**
   - [ ] 服务器是否正确设置CORS头部
   - [ ] 是否有重复的CORS中间件
   - [ ] 允许的源是否包含前端域名

3. **验证网络连接**
   - [ ] 防火墙是否阻止连接
   - [ ] 代理设置是否正确
   - [ ] DNS解析是否正常

4. **前端配置检查**
   - [ ] API地址是否正确
   - [ ] 请求方法和头部是否合适
   - [ ] 错误处理是否完善

---

## 📚 相关资源

- [MDN CORS文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vite代理配置](https://vitejs.dev/config/server-options.html#server-proxy)
- [Flask-CORS文档](https://flask-cors.readthedocs.io/)
- [Django CORS头文档](https://github.com/adamchainz/django-cors-headers)

---

**创建时间：** 2025年10月11日  
**适用版本：** React 18+, Vite 4+  
**维护状态：** 活跃维护