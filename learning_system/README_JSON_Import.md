# JSON 数据导入功能技术手册

## 概述

本模块为 Odoo 16 学习系统提供了完整的 JSON 数据导入功能，可以将 React 应用使用的 `unified_learning_data.json` 文件直接导入到 Odoo 系统中。

## 功能特性

### 1. 双模式导入
- **文件导入**: 上传 JSON 文件进行导入
- **文本导入**: 直接粘贴 JSON 内容进行导入

### 2. 数据预览
- 导入前可预览数据结构
- 显示学习集数量、词汇数量、句子数量
- 展示部分示例数据

### 3. 覆盖选项
- 可选择是否覆盖已存在的同名学习集
- 安全检查，防止意外数据丢失

### 4. 完整的数据映射
- 学习集 (Learning Sets)
- 词汇 (Vocabulary) 及其线索 (Cues)
- 句子 (Sentences) 及其语法分析

## 使用方法

### 方法一：从菜单访问
1. 登录 Odoo 系统
2. 进入 **学习系统** 应用
3. 点击 **配置** → **导入 JSON 数据**

### 方法二：从学习集页面访问
1. 进入 **学习系统** → **学习集**
2. 打开任意学习集记录（或创建新记录）
3. 点击页面顶部的 **Import JSON Data** 按钮

## 导入步骤

### 1. 选择导入模式
- **从文件导入**: 点击 "选择文件" 上传 JSON 文件
- **从文本导入**: 直接将 JSON 内容粘贴到文本框中

### 2. 设置导入选项
- **覆盖已存在的学习集**: 
  - 启用：删除同名学习集并重新创建
  - 禁用：如果存在同名学习集则停止导入

### 3. 预览数据（可选）
- 点击 **预览数据** 按钮
- 查看将要导入的数据结构和内容摘要
- 确认数据格式正确

### 4. 执行导入
- 点击 **开始导入** 按钮
- 系统会显示确认对话框
- 确认后开始导入过程

## JSON 数据格式要求

### 基本结构
```json
{
  "learning_set_name": {
    "description": "学习集描述",
    "fullText": "完整文本内容",
    "user": "目标用户",
    "vocabulary": [...],
    "sentences": [...]
  }
}
```

### 词汇数据结构
```json
{
  "word": "单词",
  "translation": "翻译",
  "example": "例句",
  "commonMistake": "常见错误",
  "lambda": 0.1,
  "cues": [
    {
      "type": "线索类型",
      "text": "线索文本",
      "strength": 1.0
    }
  ]
}
```

### 句子数据结构
```json
{
  "id": "句子ID",
  "title": "句子标题",
  "sentence": "句子内容",
  "lambda": 0.1,
  "prediction": {
    "question": "预测问题",
    "wrongOptions": ["错误选项1", "错误选项2"],
    "correctAnswer": "正确答案",
    "explanation": "解释"
  },
  "grammar": {
    "pattern": "语法模式",
    "breakdown": {
      "语法分析": "详细内容"
    }
  }
}
```

## 数据映射关系

| JSON 字段 | Odoo 模型字段 | 说明 |
|-----------|---------------|------|
| 学习集名称 | learning.set.name | 内部标识名称 |
| description | learning.set.description | 显示名称 |
| fullText | learning.set.full_text | 完整文本内容 |
| user | learning.set.user | 目标用户 |
| vocabulary.word | learning.vocabulary.word | 词汇单词 |
| vocabulary.translation | learning.vocabulary.translation | 词汇翻译 |
| vocabulary.cues | learning.cue | 词汇线索（一对多） |
| sentences.id | learning.sentence.sentence_id | 句子标识 |
| sentences.prediction | 多个字段 | 预测相关字段 |
| sentences.grammar | 多个字段 | 语法相关字段 |

## 错误处理

### 常见错误及解决方案

1. **JSON 格式错误**
   - 错误信息：`JSON 格式错误: ...`
   - 解决方案：检查 JSON 语法，确保格式正确

2. **学习集已存在**
   - 错误信息：`学习集 'xxx' 已存在`
   - 解决方案：启用"覆盖已存在的学习集"选项或手动删除现有数据

3. **文件编码问题**
   - 错误信息：`文件编码不支持`
   - 解决方案：确保文件使用 UTF-8 编码保存

4. **数据字段缺失**
   - 系统会使用默认值自动处理缺失字段
   - 建议检查导入后的数据完整性

## 性能考虑

### 大数据集导入
- 建议单次导入的学习集不超过 10 个
- 每个学习集的词汇数量建议不超过 1000 个
- 每个学习集的句子数量建议不超过 500 个

### 导入时间估算
- 小型数据集（< 100 词汇）：1-5 秒
- 中型数据集（100-500 词汇）：5-15 秒
- 大型数据集（500+ 词汇）：15-60 秒

## 安全注意事项

1. **数据备份**
   - 导入前建议备份现有数据
   - 特别是启用"覆盖"选项时

2. **权限控制**
   - 只有具有相应权限的用户才能执行导入操作
   - 建议限制导入功能的访问权限

3. **数据验证**
   - 系统会自动验证 JSON 格式
   - 建议导入前使用预览功能检查数据

## API 集成

### 程序化导入
如需通过代码进行导入，可使用以下方法：

```python
# 获取学习集模型
learning_set_model = self.env['learning.set']

# 导入 JSON 数据
json_data = {...}  # 你的 JSON 数据
result = learning_set_model.import_from_json_data(json_data)

# 检查结果
if result['success']:
    print(f"导入成功: {result['message']}")
else:
    print(f"导入失败: {result.get('error', '未知错误')}")
```

## 故障排除

### 导入失败时的检查清单
1. ✅ JSON 格式是否正确
2. ✅ 文件编码是否为 UTF-8
3. ✅ 数据结构是否符合要求
4. ✅ 是否存在同名学习集冲突
5. ✅ 用户是否有足够权限
6. ✅ 系统资源是否充足

### 日志查看
- 导入过程中的详细错误信息会记录在 Odoo 日志中
- 可通过 **设置** → **技术** → **日志** 查看详细信息

## 更新历史

- **v1.0**: 初始版本，支持基本的 JSON 导入功能
- **v1.1**: 添加数据预览功能
- **v1.2**: 增强错误处理和用户体验

## 技术支持

如遇到技术问题，请提供以下信息：
1. 错误信息截图
2. 导入的 JSON 文件（敏感数据请脱敏）
3. Odoo 版本和模块版本
4. 系统环境信息

---

*本手册基于 Odoo 16 和学习系统模块 v1.0 编写*