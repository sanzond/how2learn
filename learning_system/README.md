# Learning System - Odoo 16 模块

## 📋 模块概述

这是一个基于 Rescorla-Wagner 学习理论的自适应学习系统 Odoo 模块，为 React 前端应用提供数据管理和 API 服务。

## 🏗️ 数据模型结构

### 1. Learning Set (学习集)
- **模型**: `learning.set`
- **功能**: 管理学习内容集合
- **字段**:
  - `name`: 内部名称 (如: mentalStateSentences)
  - `description`: 显示名称 (如: 心理状态内容)
  - `full_text`: 完整学习文本内容
  - `user`: 目标用户群体
  - `vocabulary_ids`: 关联的词汇列表
  - `sentence_ids`: 关联的句子列表

### 2. Learning Vocabulary (学习词汇)
- **模型**: `learning.vocabulary`
- **功能**: 管理词汇学习内容
- **字段**:
  - `word`: 词汇单词
  - `translation`: 翻译
  - `example`: 例句
  - `common_mistake`: 常见错误
  - `lambda_value`: 学习难度系数
  - `cue_ids`: 关联的学习线索

### 3. Learning Cue (学习线索)
- **模型**: `learning.cue`
- **功能**: 管理词汇学习线索
- **字段**:
  - `cue_type_char`: 线索类型 (context, synonym, time, etc.)
  - `text`: 线索内容
  - `strength`: 线索强度

### 4. Learning Sentence (学习句子)
- **模型**: `learning.sentence`
- **功能**: 管理句子理解学习
- **字段**:
  - `sentence`: 句子内容
  - `prediction_question`: 预测问题
  - `wrong_options`: 错误选项
  - `correct_answer`: 正确答案
  - `explanation`: 解释说明
  - `grammar_pattern`: 语法模式
  - `grammar_breakdown`: 语法分解 (JSON格式)

## 🚀 安装和配置

### 1. 模块安装
```bash
# 1. 将模块复制到 Odoo addons 目录
cp -r learning_system /path/to/odoo/addons/

# 2. 重启 Odoo 服务
sudo systemctl restart odoo

# 3. 在 Odoo Apps 中搜索 "Learning System" 并安装
```

### 2. 演示数据
模块包含演示数据，安装后会自动创建:
- 2个学习集 (心理状态内容、背痛相关内容)
- 示例词汇和学习线索
- 示例句子和语法分析

### 3. API 端点配置
模块提供以下 RESTful API 端点:

```bash
# 获取所有学习数据
GET /api/learning/data

# 获取学习集列表
GET /api/learning/sets

# 获取特定学习集
GET /api/learning/set/<id>

# 保存学习进度 (未来实现)
POST /api/learning/progress
```

## 📊 使用方法

### 1. 通过 Odoo 界面管理数据
- **学习集管理**: 应用 → Learning System → Learning Sets
- **词汇管理**: 应用 → Learning System → Vocabulary
- **句子管理**: 应用 → Learning System → Sentences
- **线索管理**: 应用 → Learning System → Configuration → Learning Cues

### 2. API 数据导出
```python
# 在 Odoo 中导出 JSON 数据
learning_set = env['learning.set'].browse(1)
json_data = learning_set.export_to_json()
```

### 3. React 应用集成
```javascript
// 在 React 应用中获取数据
const response = await fetch('http://127.0.0.1:18080//api/learning/data');
const learningData = await response.json();
```

## 🔧 自定义和扩展

### 1. 添加新的线索类型
在 `models/cue.py` 中的 `cue_type_char` 字符字段中添加新类型:

```python
cue_type_char = fields.Char('Cue Type', required=True, default='text',
    help="Type of cue (e.g., context, synonym, time, feeling, image, pattern, anatomy, category, opposite, symptom, purpose, etc.)")
    # 现在支持任意类型...
    ('new_type', 'New Type'),
], string='Cue Type', required=True)
```

### 2. 扩展 API 功能
在 `controllers/api_controller.py` 中添加新的端点:

```python
@http.route('/api/learning/custom', type='http', auth='public', methods=['GET'])
def custom_endpoint(self):
    # 自定义逻辑
    pass
```

### 3. 添加学习进度跟踪
可以创建新模型来跟踪用户学习进度:

```python
class LearningProgress(models.Model):
    _name = 'learning.progress'
    _description = 'Learning Progress'
    
    user_id = fields.Many2one('res.users', string='User')
    vocabulary_id = fields.Many2one('learning.vocabulary', string='Vocabulary')
    strength = fields.Float('Current Strength')
    trials = fields.Integer('Number of Trials')
```

## 🔄 与 React 应用的数据同步

### 1. 数据结构映射
Odoo 模块的数据结构完全兼容现有的 JSON 格式:

```json
{
  "mentalStateSentences": {
    "fullText": "...",
    "description": "...",
    "user": "public",
    "vocabulary": [...],
    "sentences": [...]
  }
}
```

### 2. 实时数据更新
- 在 Odoo 中更新数据后，React 应用可以通过 API 获取最新数据
- 支持 CORS 跨域访问
- 提供公开访问权限 (适合演示环境)

## 🛡️ 安全性配置

### 1. 访问权限
- **用户组**: 完整的读写权限
- **公开访问**: 只读权限 (适合 API 访问)

### 2. API 安全性
- 当前配置为公开访问 (适合演示)
- 生产环境建议添加认证机制

## 📈 性能优化

### 1. 数据库索引
建议在以下字段上添加索引:
- `learning.set.name`
- `learning.vocabulary.word`
- `learning.sentence.sentence_id`

### 2. API 缓存
可以在控制器中添加缓存机制以提高性能。

## 🐛 故障排除

### 1. 模块安装失败
- 检查依赖模块是否安装
- 确认文件权限正确
- 查看 Odoo 日志文件

### 2. API 无法访问
- 检查 CORS 配置
- 确认路由配置正确
- 验证防火墙设置

### 3. 数据导出问题
- 检查 JSON 格式是否正确
- 确认所有必需字段都有值
- 查看模型关联是否正确

## 📞 技术支持

如有问题，请检查:
1. Odoo 版本兼容性 (需要 16.0+)
2. Python 依赖包
3. 数据库连接
4. 模块配置文件

---

**版本**: 16.0.1.0.0  
**许可证**: LGPL-3  
**兼容性**: Odoo 16.0+