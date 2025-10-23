from odoo import models, fields, api
from odoo.exceptions import UserError
import json
import re
import logging

_logger = logging.getLogger(__name__)


class AIGenerator(models.TransientModel):
    _name = 'learning.ai.generator'
    _description = 'AI Learning Data Generator'

    learning_set_id = fields.Many2one('learning.set', string='Learning Set', required=True)
    ai_config_id = fields.Many2one('learning.ai.config', string='AI Provider', required=True)

    # Display field for learning set full text
    full_text_display = fields.Text('Full Text', related='learning_set_id.full_text', readonly=True)

    # Generation options
    generate_mode = fields.Selection([
        ('replace', 'Replace All Data'),
        ('append', 'Append to Existing Data'),
        ('update', 'Update Existing Data'),
        ('batch', 'Batch Generation (Vocabulary First, Then Sentences)')
    ], string='Generation Mode', default='batch', required=True)

    # Status fields
    status = fields.Selection([
        ('draft', 'Draft'),
        ('generating', 'Generating'),
        ('generating_vocab', 'Generating Vocabulary'),
        ('generating_sentences', 'Generating Sentences'),
        ('success', 'Success'),
        ('error', 'Error')
    ], string='Status', default='draft', readonly=True)

    progress_message = fields.Text('Progress Message', readonly=True)
    generated_data = fields.Text('Generated Data', readonly=True)
    error_message = fields.Text('Error Message', readonly=True)

    # API调用记录字段
    prompt_used = fields.Text('Prompt Used', readonly=True, help='记录使用的提示词')
    ai_model_used = fields.Char('AI Model Used', readonly=True, help='记录使用的AI模型')
    api_response_raw = fields.Text('API Response Raw', readonly=True, help='记录原始API响应')
    tokens_used = fields.Integer('Tokens Used', readonly=True, help='记录使用的token数量')
    api_call_time = fields.Datetime('API Call Time', readonly=True, help='记录API调用时间')
    api_response_time = fields.Float('Response Time (seconds)', readonly=True, help='记录响应时间（秒）')
    api_cost_estimate = fields.Float('Estimated Cost', readonly=True, help='预估调用成本')
    call_log = fields.Text('Call Log', readonly=True, help='详细调用日志')

    # Batch generation state fields
    vocabulary_data = fields.Text('Vocabulary Data', readonly=True, help='词汇批次生成的数据')
    sentences_data = fields.Text('Sentences Data', readonly=True, help='句子批次生成的数据')

    @api.model
    def default_get(self, fields_list):
        """Set default AI provider"""
        defaults = super().default_get(fields_list)
        if 'ai_config_id' in fields_list:
            default_provider = self.env['learning.ai.config'].get_default_provider()
            if default_provider:
                defaults['ai_config_id'] = default_provider.id
        return defaults

    def action_generate_data(self):
        """Generate learning data using AI"""
        if self.generate_mode == 'batch':
            return self.action_generate_batch_data()
        else:
            return self.action_generate_complete_data()

    def action_generate_complete_data(self):
        """Generate complete learning data in one call"""
        import time
        from datetime import datetime

        start_time = time.time()
        call_log_entries = []

        try:
            self.status = 'generating'
            self.progress_message = '正在生成学习数据...'
            self.api_call_time = datetime.now()
            call_log_entries.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - 开始生成学习数据")
            call_log_entries.append(f"学习集: {self.learning_set_id.name}")
            call_log_entries.append(f"AI提供商: {self.ai_config_id.provider_name}")
            call_log_entries.append(f"模型: {self.ai_config_id.model_name}")
            self._cr.commit()

            # Build prompt
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 构建提示词")
            prompt = self._build_prompt()
            self.prompt_used = prompt
            call_log_entries.append(f"提示词长度: {len(prompt)} 字符")

            # Record AI model info
            self.ai_model_used = f"{self.ai_config_id.provider_name} - {self.ai_config_id.model_name}"

            # Call AI API
            self.progress_message = '正在调用AI API...'
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 开始调用AI API")
            self._cr.commit()

            api_start_time = time.time()
            ai_response = self.ai_config_id._call_ai_api(prompt)
            api_end_time = time.time()

            # Record API response details
            self.api_response_raw = ai_response
            self.api_response_time = round(api_end_time - api_start_time, 2)
            call_log_entries.append(
                f"{datetime.now().strftime('%H:%M:%S')} - API调用完成，耗时: {self.api_response_time}秒")
            call_log_entries.append(f"响应长度: {len(ai_response)} 字符")

            # Estimate tokens and cost
            estimated_prompt_tokens = len(prompt) // 4
            estimated_response_tokens = len(ai_response) // 4
            total_tokens = estimated_prompt_tokens + estimated_response_tokens
            self.tokens_used = total_tokens
            call_log_entries.append(
                f"预估Token使用: {total_tokens} (输入: {estimated_prompt_tokens}, 输出: {estimated_response_tokens})")

            # Estimate cost
            cost_per_1k_tokens = {
                'OpenAI': 0.002,
                'Google': 0.001,
                'DeepSeek': 0.0001,
                'Anthropic': 0.003,
            }
            provider_name = self.ai_config_id.provider_name
            cost_rate = cost_per_1k_tokens.get(provider_name, 0.002)
            self.api_cost_estimate = round((total_tokens / 1000) * cost_rate, 4)
            call_log_entries.append(f"预估成本: ${self.api_cost_estimate}")

            # Parse JSON response
            self.progress_message = '正在解析AI响应...'
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 开始解析JSON响应")
            self._cr.commit()

            try:
                json_data = self._parse_ai_response(ai_response)
                self.generated_data = json.dumps(json_data, ensure_ascii=False, indent=2)
                call_log_entries.append(f"JSON解析成功，数据结构: {list(json_data.keys())}")
            except UserError as parse_error:
                # Handle JSON parsing error
                end_time = time.time()
                total_time = round(end_time - start_time, 2)
                call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - JSON解析失败: {str(parse_error)}")
                call_log_entries.append(f"总耗时: {total_time}秒")

                self.status = 'error'
                self.error_message = str(parse_error)
                self.progress_message = f'JSON解析失败：{str(parse_error)}'
                self.call_log = '\n'.join(call_log_entries)

                _logger.error(
                    f"AI响应JSON解析失败 - 学习集: {self.learning_set_id.name}, 模型: {self.ai_model_used}, 错误: {str(parse_error)}")

                filename = f'AI_ERROR_{self.learning_set_id.name}_{datetime.now().strftime("%Y%m%d%H%M%S")}.txt'
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(str(parse_error))

                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'title': f'AI响应解析错误{filename}',
                        'message': str(parse_error),
                        'type': 'danger',
                        'sticky': True,
                        'fadeout': 30000,
                    }
                }

            # Import data
            self.progress_message = '正在导入数据到模型...'
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 开始导入数据到模型")
            self._cr.commit()

            self._import_generated_data(json_data)

            # Final success logging
            end_time = time.time()
            total_time = round(end_time - start_time, 2)
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 数据导入完成")
            call_log_entries.append(f"总耗时: {total_time}秒")
            call_log_entries.append("=" * 50)
            call_log_entries.append("生成完成！")

            self.status = 'success'
            self.progress_message = '学习数据生成完成！'
            self.call_log = '\n'.join(call_log_entries)

            _logger.info(
                f"AI数据生成成功 - 学习集: {self.learning_set_id.name}, 模型: {self.ai_model_used}, Token: {self.tokens_used}, 耗时: {total_time}s, 成本: ${self.api_cost_estimate}")

            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': '生成成功',
                    'message': f'学习数据已成功生成并导入\n使用Token: {self.tokens_used}\n预估成本: ${self.api_cost_estimate}\n总耗时: {total_time}秒',
                    'type': 'success',
                }
            }

        except Exception as e:
            end_time = time.time()
            total_time = round(end_time - start_time, 2)
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 发生错误: {str(e)}")
            call_log_entries.append(f"总耗时: {total_time}秒")

            self.status = 'error'
            self.error_message = str(e)
            self.progress_message = f'生成失败：{str(e)}'
            self.call_log = '\n'.join(call_log_entries)

            _logger.error(
                f"AI数据生成失败 - 学习集: {self.learning_set_id.name}, 模型: {self.ai_model_used}, 错误: {str(e)}, 耗时: {total_time}s")

            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': '生成失败',
                    'message': str(e),
                    'type': 'danger',
                }
            }

    def action_generate_batch_data(self):
        """Generate data in batches: vocabulary first, then sentences"""
        import time
        from datetime import datetime

        start_time = time.time()
        call_log_entries = []
        total_tokens = 0
        total_cost = 0.0

        try:
            self.status = 'generating_vocab'
            self.progress_message = '正在分批生成学习数据...第1步：生成词汇'
            self.api_call_time = datetime.now()
            call_log_entries.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - 开始分批生成学习数据")
            call_log_entries.append(f"学习集: {self.learning_set_id.name}")
            call_log_entries.append(f"AI提供商: {self.ai_config_id.provider_name}")
            call_log_entries.append(f"模型: {self.ai_config_id.model_name}")
            call_log_entries.append("=" * 30)
            call_log_entries.append("第1步：生成词汇数据")
            self._cr.commit()

            # Step 1: Generate vocabulary
            vocab_prompt = self._build_batch_prompt('vocabulary')
            call_log_entries.append(
                f"{datetime.now().strftime('%H:%M:%S')} - 构建词汇提示词，长度: {len(vocab_prompt)} 字符")

            vocab_start_time = time.time()
            vocab_response = self.ai_config_id._call_ai_api(vocab_prompt)
            vocab_end_time = time.time()

            vocab_response_time = round(vocab_end_time - vocab_start_time, 2)
            call_log_entries.append(
                f"{datetime.now().strftime('%H:%M:%S')} - 词汇API调用完成，耗时: {vocab_response_time}秒")

            # Parse vocabulary response
            try:
                vocab_data = self._parse_batch_response(vocab_response, 'vocabulary')
                self.vocabulary_data = json.dumps(vocab_data, ensure_ascii=False, indent=2)
                call_log_entries.append(f"词汇JSON解析成功，生成 {len(vocab_data)} 个词汇")
            except UserError as parse_error:
                self._handle_batch_error('vocabulary', parse_error, call_log_entries, start_time)
                return self._return_error_notification(f'词汇生成失败: {str(parse_error)}')

            # Import vocabulary data immediately
            self._import_vocabulary_data(vocab_data)
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 词汇数据导入完成")

            # Calculate tokens and cost for vocabulary
            vocab_tokens = len(vocab_prompt) // 4 + len(vocab_response) // 4
            total_tokens += vocab_tokens
            call_log_entries.append(f"词汇生成Token使用: {vocab_tokens}")

            # Step 2: Generate sentences
            self.status = 'generating_sentences'
            self.progress_message = '正在分批生成学习数据...第2步：生成句子'
            call_log_entries.append("=" * 30)
            call_log_entries.append("第2步：生成句子数据")
            self._cr.commit()

            sentences_prompt = self._build_batch_prompt('sentences')
            call_log_entries.append(
                f"{datetime.now().strftime('%H:%M:%S')} - 构建句子提示词，长度: {len(sentences_prompt)} 字符")

            sentences_start_time = time.time()
            sentences_response = self.ai_config_id._call_ai_api(sentences_prompt)
            sentences_end_time = time.time()

            sentences_response_time = round(sentences_end_time - sentences_start_time, 2)
            call_log_entries.append(
                f"{datetime.now().strftime('%H:%M:%S')} - 句子API调用完成，耗时: {sentences_response_time}秒")

            # Parse sentences response
            try:
                sentences_data = self._parse_batch_response(sentences_response, 'sentences')
                self.sentences_data = json.dumps(sentences_data, ensure_ascii=False, indent=2)
                call_log_entries.append(f"句子JSON解析成功，生成 {len(sentences_data)} 个句子")
            except UserError as parse_error:
                self._handle_batch_error('sentences', parse_error, call_log_entries, start_time)
                return self._return_error_notification(f'句子生成失败: {str(parse_error)}')

            # Import sentences data
            self._import_sentences_data(sentences_data)
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 句子数据导入完成")

            # Calculate tokens and cost for sentences
            sentences_tokens = len(sentences_prompt) // 4 + len(sentences_response) // 4
            total_tokens += sentences_tokens
            call_log_entries.append(f"句子生成Token使用: {sentences_tokens}")

            # Final calculations
            self.tokens_used = total_tokens
            cost_per_1k_tokens = {
                'OpenAI': 0.002,
                'Google': 0.001,
                'DeepSeek': 0.0001,
                'Anthropic': 0.003,
            }
            provider_name = self.ai_config_id.provider_name
            cost_rate = cost_per_1k_tokens.get(provider_name, 0.002)
            self.api_cost_estimate = round((total_tokens / 1000) * cost_rate, 4)

            total_response_time = vocab_response_time + sentences_response_time
            self.api_response_time = total_response_time

            # Combine all data for generated_data field
            combined_data = {
                self.learning_set_id.name: {
                    "fullText": self.learning_set_id.full_text,
                    "description": f"{self.learning_set_id.name} - 分批生成",
                    "vocabulary": vocab_data,
                    "sentences": sentences_data
                }
            }
            self.generated_data = json.dumps(combined_data, ensure_ascii=False, indent=2)

            # Final success logging
            end_time = time.time()
            total_time = round(end_time - start_time, 2)
            call_log_entries.append("=" * 50)
            call_log_entries.append("分批生成完成！")
            call_log_entries.append(f"总Token使用: {total_tokens} (词汇: {vocab_tokens}, 句子: {sentences_tokens})")
            call_log_entries.append(f"总API耗时: {total_response_time}秒")
            call_log_entries.append(f"总耗时: {total_time}秒")
            call_log_entries.append(f"预估成本: ${self.api_cost_estimate}")

            self.status = 'success'
            self.progress_message = '分批学习数据生成完成！'
            self.call_log = '\n'.join(call_log_entries)
            self.ai_model_used = f"{self.ai_config_id.provider_name} - {self.ai_config_id.model_name} (批次模式)"

            _logger.info(
                f"AI分批数据生成成功 - 学习集: {self.learning_set_id.name}, 模型: {self.ai_model_used}, Token: {self.tokens_used}, 耗时: {total_time}s, 成本: ${self.api_cost_estimate}")

            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': '分批生成成功',
                    'message': f'学习数据已成功分批生成并导入\n词汇: {len(vocab_data)} 个\n句子: {len(sentences_data)} 个\n使用Token: {self.tokens_used}\n预估成本: ${self.api_cost_estimate}\n总耗时: {total_time}秒',
                    'type': 'success',
                }
            }

        except Exception as e:
            end_time = time.time()
            total_time = round(end_time - start_time, 2)
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 发生错误: {str(e)}")
            call_log_entries.append(f"总耗时: {total_time}秒")

            self.status = 'error'
            self.error_message = str(e)
            self.progress_message = f'分批生成失败：{str(e)}'
            self.call_log = '\n'.join(call_log_entries)

            _logger.error(
                f"AI分批数据生成失败 - 学习集: {self.learning_set_id.name}, 模型: {self.ai_model_used}, 错误: {str(e)}, 耗时: {total_time}s")

            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': '分批生成失败',
                    'message': str(e),
                    'type': 'danger',
                }
            }

    def _handle_batch_error(self, batch_type, error, call_log_entries, start_time):
        """Handle batch generation error"""
        from datetime import datetime
        import time

        end_time = time.time()
        total_time = round(end_time - start_time, 2)
        call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - {batch_type}JSON解析失败: {str(error)}")
        call_log_entries.append(f"总耗时: {total_time}秒")

        self.status = 'error'
        self.error_message = str(error)
        self.progress_message = f'{batch_type}生成失败：{str(error)}'
        self.call_log = '\n'.join(call_log_entries)

        filename = f'AI_BATCH_ERROR_{batch_type}_{self.learning_set_id.name}_{datetime.now().strftime("%Y%m%d%H%M%S")}.txt'
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(str(error))

        _logger.error(f"AI分批{batch_type}生成失败 - 学习集: {self.learning_set_id.name}, 错误: {str(error)}")

    def _return_error_notification(self, message):
        """Return error notification"""
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': '分批生成错误',
                'message': message,
                'type': 'danger',
                'sticky': True,
                'fadeout': 30000,
            }
        }

    def _build_prompt(self):
        """Build prompt for AI generation"""
        try:
            prompt_file_path = '/learning_system/data/learning_data_generation_prompt.md'
            with open(prompt_file_path, 'r', encoding='utf-8') as f:
                prompt_template = f.read()
        except:
            prompt_template = self._get_embedded_prompt()

        full_text = self.learning_set_id.full_text

        final_prompt = f"""
{prompt_template}

## 当前任务

请根据以下英文句子生成学习数据：

{full_text}

请严格按照上述格式要求生成完整的JSON学习数据结构。注意：
1. 只返回JSON数据，不要包含其他解释文字
2. 确保JSON格式正确，可以被程序解析
3. 使用学习集名称：{self.learning_set_id.name}
4. 保持所有lambda值为10，strength值为0
"""
        return final_prompt

    def _build_batch_prompt(self, batch_type):
        """Build prompt for batch generation (vocabulary or sentences)"""
        full_text = self.learning_set_id.full_text

        if batch_type == 'vocabulary':
            return self._get_vocabulary_prompt(full_text)
        elif batch_type == 'sentences':
            return self._get_sentences_prompt(full_text)
        else:
            raise UserError(f"未知的批次类型: {batch_type}")

    def _get_vocabulary_prompt(self, full_text):
        """Get prompt for vocabulary generation"""
        return f"""
# 英语词汇学习数据生成

你是一个专业的英语教学内容生成专家，请根据给定的英文句子，生成词汇学习数据。

## 输出格式要求
生成一个JSON数组，包含词汇对象：


```json
[
  {{
    "word": "[词汇单词]",
    "cues": [
      {{ "type": "phonetic", "text": "[美式音标]", "strength": 0 }},
      {{ "type": "context", "text": "[完整的输入文本]中包含[词汇单词]替换为___", "strength": 0 }},
      {{ "type": "synonym", "text": "[同义词]", "strength": 0 }},
      {{ "type": "antonymy", "text": "[反义词]", "strength": 0 }},
      {{ "type": "image", "text": "[相关emoji]", "strength": 0 }}
    ],
    "translation": "[中文翻译]",
    "example": "[英文例句]",
    "commonMistake": "[常见错误说明]",
    "lambda": 10
  }}
]
```

## 当前任务
请根据以下英文内容生成4-8个关键词汇的学习数据：

{full_text}

要求：
1. 选择关键且有学习价值的词汇，避免过于简单的词汇
2. 每个词汇恰好4个线索，类型要多样化
3. 线索类型包含：phonetic, context, synonym/antonym, image等
4. 只返回JSON数组，不要包含其他解释文字
"""

    def _get_sentences_prompt(self, full_text):
        """Get prompt for sentences generation"""
        return f"""
# 英语句子学习数据生成

你是一个专业的英语教学内容生成专家，请根据给定的英文句子，生成句子学习数据。

## 输出格式要求
生成一个JSON数组，包含句子对象：

```json
[
  {{
    "id": 1,
    "title": "[句子标题：语法要点]",
    "sentence": "[完整句子]",
    "prediction": {{
      "question": "[预测理解问题]",
      "wrongOptions": [
        "[错误选项1（错误原因）]",
        "[错误选项2（错误原因）]",
        "[错误选项3（错误原因）]"
      ],
      "correctAnswer": "[正确答案]",
      "explanation": "[详细解释]"
    }},
    "grammar": {{
      "pattern": "[语法模式]",
      "breakdown": {{
        "[语法成分1]": "[成分说明]",
        "[语法成分2]": "[成分说明]"
      }}
    }},
    "lambda": 10
  }}
]
```

## 当前任务
请根据以下英文内容生成句子学习数据：

{full_text}

要求：
1. 为每个句子生成预测问题和语法分析
2. 预测问题要能够测试理解能力
3. 语法分析要详细说明句子结构
4. 只返回JSON数组，不要包含其他解释文字
"""

    def _get_embedded_prompt(self):
        """Embedded prompt template as fallback"""
        return """
# 英语学习数据生成提示词

你是一个专业的英语教学内容生成专家，请根据给定的英文句子，生成完整的学习数据结构。
理论：学习的发生并非源于两个事件的简单配对（contiguity），而是源于这种配对在多大程度上出乎了有机体的"意料"（contingency）。换句话说，当现实与预期不符时，学习才会被触发。
生成要求：先激活错误预期，再纠正,同一概念用多种提示,先教核心，后教细节,从高误差到低误差.

## 输出格式要求
生成一个JSON对象，包含以下结构：

```json
{
  "[学习集名称]": {
    "fullText": "[完整的输入文本]",
    "description": "[中文句子概述不超过10字]",
    "chineseTranslation": "[中文翻译]",
    "vocabulary": [
      {
        "word": "[词汇单词]",
        "cues": [
          { "type": "[美国音标]", "text": "[词汇单词单标]", "strength": 0 },
          { "type": "[context]", "text": "为[完整的输入文本]中[词汇单词]的短语或句子。得到的短语或句子的[词汇单词]替换为___,例：(Lately, my back has been aching)的[context]为:(___, my back has been aching)", "strength": 0 },
          { "type": "[线索类型]", "text": "[反义词或同义词]", "strength": 0 },
          { "type": "[image]", "text": "[词汇单词emoji]", "strength": 0 }
        ],
        "translation": "[中文翻译] 一句话拆解词汇单词前缀词根后缀",
        "example": "[英文例句]",
        "commonMistake": "[常见错误说明]",
        "lambda": 10
      }
    ],
    "sentences": [
      {
        "id": [句子序号],
        "title": "[句子标题：语法要点]",
        "sentence": "[完整句子]",
        "prediction": {
          "question": "[预测理解问题]",
          "wrongOptions": [
            "[错误选项1（错误原因）]",
            "[错误选项2（错误原因）]",
            "[错误选项3（错误原因）]"
          ],
          "correctAnswer": "[正确答案]",
          "explanation": "[详细解释]"
        },
        "grammar": {
          "pattern": "[语法模式]",
          "breakdown": {
            "[语法成分1]": "[成分说明]",
            "[语法成分2]": "[成分说明]"
          }
        },
        "lambda": 10
      }
    ]
  }
}
```
要求：
1. 选择4-8个关键词汇，避免过于简单的词汇
2. 每个词汇恰好3个线索，类型要多样化
3. 线索类型至少包含context,synonym或antonymy,image,不只限于：feeling,pattern,category
4. 为每个句子生成预测问题和语法分析
"""

    def _parse_ai_response(self, ai_response):
        """Parse AI response to extract JSON data"""
        try:
            json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                return json.loads(ai_response)
        except json.JSONDecodeError as e:
            raise UserError(f"AI响应格式错误，无法解析JSON: {str(e)}\n\n响应内容:\n{ai_response}")

    def _parse_batch_response(self, ai_response, batch_type):
        """Parse batch AI response to extract JSON array data"""
        try:
            # Try to find JSON array in response
            json_match = re.search(r'\[.*\]', ai_response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                return json.loads(ai_response)
        except json.JSONDecodeError as e:
            raise UserError(f"AI {batch_type} 响应格式错误，无法解析JSON: {str(e)}\n\n响应内容:\n{ai_response}")

    def _import_generated_data(self, json_data):
        """Import generated data to models"""
        try:
            # Get the first learning set data
            set_name = list(json_data.keys())[0]
            set_data = json_data[set_name]

            # Update learning.set name and description
            self.learning_set_id.write({
                'name': set_name,
                'description': set_data.get('description', set_name),
            })

            # Import vocabulary and sentences
            vocabulary_data = set_data.get('vocabulary', [])
            sentences_data = set_data.get('sentences', [])

            self._import_vocabulary_data(vocabulary_data)
            self._import_sentences_data(sentences_data)

            _logger.info(
                f"Successfully imported AI generated data: {len(vocabulary_data)} vocabulary items, {len(sentences_data)} sentences")

        except Exception as e:
            _logger.error(f"Failed to import generated data: {str(e)}")
            raise UserError(f"数据导入失败: {str(e)}")

    def _import_vocabulary_data(self, vocabulary_data):
        """Import vocabulary data"""
        for vocab_item in vocabulary_data:
            vocab = self.env['learning.vocabulary'].create({
                'learning_set_id': self.learning_set_id.id,
                'word': vocab_item.get('word', ''),
                'translation': vocab_item.get('translation', ''),
                'example': vocab_item.get('example', ''),
                'common_mistake': vocab_item.get('commonMistake', ''),
                'lambda_value': vocab_item.get('lambda', 10),
            })

            # Add cues for this vocabulary
            cues_data = vocab_item.get('cues', [])
            for cue_item in cues_data:
                self.env['learning.cue'].create({
                    'vocabulary_id': vocab.id,
                    'cue_type_char': cue_item.get('type', 'context'),
                    'text': cue_item.get('text', ''),
                    'strength': cue_item.get('strength', 0.0),
                })

    def _import_sentences_data(self, sentences_data):
        """Import sentences data"""
        for sentence_item in sentences_data:
            prediction = sentence_item.get('prediction', {})
            grammar = sentence_item.get('grammar', {})

            # Format wrong options text
            wrong_options = prediction.get('wrongOptions', [])
            wrong_options_text = '\n'.join(wrong_options)

            # Format grammar breakdown
            breakdown = grammar.get('breakdown', {})
            breakdown_text = '\n'.join([f"{key}: {value}" for key, value in breakdown.items()])

            self.env['learning.sentence'].create({
                'learning_set_id': self.learning_set_id.id,
                'sentence_id': sentence_item.get('id', 1),
                'title': sentence_item.get('title', ''),
                'sentence': sentence_item.get('sentence', ''),
                'prediction_question': prediction.get('question', ''),
                'wrong_options': wrong_options_text,
                'correct_answer': prediction.get('correctAnswer', ''),
                'explanation': prediction.get('explanation', ''),
                'grammar_pattern': grammar.get('pattern', ''),
                'grammar_breakdown': breakdown_text,
                'lambda_value': sentence_item.get('lambda', 10),
            })

    def action_view_generated_data(self):
        """View generated data"""
        if not self.generated_data:
            raise UserError("没有生成的数据可查看")

        return {
            'type': 'ir.actions.act_window',
            'name': '生成的数据',
            'res_model': 'learning.ai.generator',
            'res_id': self.id,
            'view_mode': 'form',
            'view_id': self.env.ref('learning_system.view_ai_generator_data_form').id,
            'target': 'new',
        }