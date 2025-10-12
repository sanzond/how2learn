# 快速导入指南

## 🚀 快速开始

1. **准备 JSON 文件**
   - 确保文件格式正确
   - 使用 UTF-8 编码保存

2. **访问导入功能**
   ```
   学习系统 → 配置 → 导入 JSON 数据
   ```

3. **执行导入**
   - 选择文件或粘贴文本
   - 点击"预览数据"检查
   - 点击"开始导入"执行

## 📋 示例 JSON 格式

```json
{
  "basic_english": {
    "description": "基础英语学习",
    "fullText": "This is a basic English learning set...",
    "user": "public",
    "vocabulary": [
      {
        "word": "hello",
        "translation": "你好",
        "example": "Hello, world!",
        "commonMistake": "不要忘记感叹号",
        "lambda": 0.1,
        "cues": [
          {
            "type": "text",
            "text": "greeting",
            "strength": 1.0
          }
        ]
      }
    ],
    "sentences": [
      {
        "id": "s1",
        "title": "问候语",
        "sentence": "Hello, how are you?",
        "lambda": 0.1,
        "prediction": {
          "question": "这句话的意思是什么？",
          "wrongOptions": ["再见", "谢谢"],
          "correctAnswer": "你好，你怎么样？",
          "explanation": "这是一个常见的英语问候语"
        },
        "grammar": {
          "pattern": "疑问句",
          "breakdown": {
            "Hello": "问候词",
            "how are you": "询问状态"
          }
        }
      }
    ]
  }
}
```

## ⚠️ 注意事项

- 导入前请备份数据
- 大文件导入可能需要较长时间
- 确保 JSON 格式正确