from odoo import models, fields, api
from odoo.exceptions import UserError
import json
import re
import logging

_logger = logging.getLogger(__name__)


class AIGeneratorBatch(models.TransientModel):
    _name = 'learning.ai.generator.batch'
    _description = 'AI Learning Data Generator with Batch Processing'

    learning_set_id = fields.Many2one('learning.set', string='Learning Set', required=True)
    ai_config_id = fields.Many2one('learning.ai.config', string='AI Provider', required=True)

    # Display field for learning set full text
    full_text_display = fields.Text('Full Text', related='learning_set_id.full_text', readonly=True)

    # Generation options
    generate_mode = fields.Selection([
        ('replace', 'Replace All Data'),
        ('append', 'Append to Existing Data'),
        ('update', 'Update Existing Data')
    ], string='Generation Mode', default='replace', required=True)

    # Status fields
    status = fields.Selection([
        ('draft', 'Draft'),
        ('generating', 'Generating'),
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
        """Generate learning data using AI with batch processing"""
        import time
        from datetime import datetime

        start_time = time.time()
        call_log_entries = []

        try:
            self.status = 'generating'
            self.progress_message = '正在分批生成学习数据...'
            self.api_call_time = datetime.now()
            call_log_entries.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - 开始分批生成学习数据")
            call_log_entries.append(f"学习集: {self.learning_set_id.name}")
            call_log_entries.append(f"AI提供商: {self.ai_config_id.provider_name}")
            call_log_entries.append(f"模型: {self.ai_config_id.model_name}")
            self._cr.commit()

            # Record AI model info
            self.ai_model_used = f"{self.ai_config_id.provider_name} - {self.ai_config_id.model_name}"

            # Step 1: Generate vocabulary data
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 第1步：生成词汇数据")
            vocabulary_data, vocab_call_log, vocab_tokens, vocab_cost, vocab_time = self._generate_batch_data('vocabulary', call_log_entries)
            
            # Step 2: Generate sentences data
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 第2步：生成句子数据")
            sentences_data, sent_call_log, sent_tokens, sent_cost, sent_time = self._generate_batch_data('sentences', call_log_entries)

            # Combine data
            combined_data = {
                self.learning_set_id.name: {
                    "fullText": self.learning_set_id.full_text,
                    "description": f"{self.learning_set_id.name}的学习内容",
                    "vocabulary": vocabulary_data,
                    "sentences": sentences_data
                }
            }

            # Record combined statistics
            total_tokens = vocab_tokens + sent_tokens
            total_cost = vocab_cost + sent_cost
            total_api_time = vocab_time + sent_time
            
            self.tokens_used = total_tokens
            self.api_cost_estimate = total_cost
            self.api_response_time = total_api_time
            
            call_log_entries.extend(vocab_call_log)
            call_log_entries.extend(sent_call_log)
            call_log_entries.append(f"总Token使用: {total_tokens} (词汇: {vocab_tokens}, 句子: {sent_tokens})")
            call_log_entries.append(f"总预估成本: ${total_cost}")

            # Store generated data
            self.generated_data = json.dumps(combined_data, ensure_ascii=False, indent=2)

            # Import data
            self.progress_message = '正在导入数据到模型...'
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 开始导入数据到模型")
            self._cr.commit()

            self._import_generated_data(combined_data)

            # Final success logging
            end_time = time.time()
            total_time = round(end_time - start_time, 2)
            call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 数据导入完成")
            call_log_entries.append(f"总耗时: {total_time}秒")
            call_log_entries.append("=" * 50)
            call_log_entries.append("分批生成完成！")

            self.status = 'success'
            self.progress_message = '学习数据分批生成完成！'
            self.call_log = '\n'.join(call_log_entries)

            # Log to system logger
            _logger.info(
                f"AI数据分批生成成功 - 学习集: {self.learning_set_id.name}, 模型: {self.ai_model_used}, Token: {self.tokens_used}, 耗时: {total_time}s, 成本: ${self.api_cost_estimate}")

            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': '分批生成成功',
                    'message': f'学习数据已成功分批生成并导入\n词汇数量: {len(vocabulary_data)}\n句子数量: {len(sentences_data)}\n使用Token: {self.tokens_used}\n预估成本: ${self.api_cost_estimate}\n总耗时: {total_time}秒',
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
                f"AI数据分批生成失败 - 学习集: {self.learning_set_id.name}, 模型: {self.ai_model_used}, 错误: {str(e)}, 耗时: {total_time}s")

            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': '分批生成失败',
                    'message': str(e),
                    'type': 'danger',
                }
            }

    def _generate_batch_data(self, batch_type, call_log_entries):
        """Generate data for a specific batch (vocabulary or sentences)"""
        import time
        from datetime import datetime
        
        call_log_entries.append(f"{datetime.now().strftime('%H:%M:%S')} - 开始生成{batch_type}数据")
        
        # Build prompt for specific batch
        prompt = self._build_batch_prompt(batch_type)
        call_log_entries.append(f"构建{batch_type}提示词，长度: {len(prompt)} 字符")
        
        # Update progress message
        self.progress_message = f'正在生成{batch_type}数据...'
        self._cr.commit()
        
        # Call AI API
        api_start_time = time.time()
        ai_response = self.ai_config_id._call_ai_api(prompt)
        api_end_time = time.time()
        
        response_time = round(api_end_time - api_start_time, 2)
        call_log_entries.append(f"{batch_type} API调用完成，耗时: {response_time}秒")
        call_log_entries.append(f"{batch_type}响应长度: {len(ai_response)} 字符")
        
        # Calculate tokens and cost
        estimated_prompt_tokens = len(prompt) // 4
        estimated_response_tokens = len(ai_response) // 4
        total_tokens = estimated_prompt_tokens + estimated_response_tokens
        
        cost_per_1k_tokens = {
            'OpenAI': 0.002,
            'Google': 0.001,
            'DeepSeek': 0.0001,
            'Anthropic': 0.003,
        }
        provider_name = self.ai_config_id.provider_name
        cost_rate = cost_per_1k_tokens.get(provider_name, 0.002)
        estimated_cost = round((total_tokens / 1000) * cost_rate, 4)
        
        call_log_entries.append(f"{batch_type}预估Token: {total_tokens}, 成本: ${estimated_cost}")
        
        # Parse JSON response
        try:
            json_data = self._parse_batch_response(ai_response, batch_type)
            call_log_entries.append(f"{batch_type}数据解析成功，数量: {len(json_data)}")
            
            # Save successful response to file
            filename = f'AI_{batch_type.upper()}_{self.learning_set_id.name}_{datetime.now().strftime("%Y%m%d%H%M%S")}.json'
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(json.dumps(json_data, ensure_ascii=False, indent=2))
                call_log_entries.append(f"{batch_type}数据已保存到: {filename}")
            
            return json_data, call_log_entries, total_tokens, estimated_cost, response_time
            
        except UserError as parse_error:
            call_log_entries.append(f"{batch_type} JSON解析失败: {str(parse_error)}")
            
            # Save error response to file
            filename = f'AI_{batch_type.upper()}_ERROR_{self.learning_set_id.name}_{datetime.now().strftime("%Y%m%d%H%M%S")}.txt'
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"Error: {str(parse_error)}\n\nResponse:\n{ai_response}")
                call_log_entries.append(f"{batch_type}错误信息已保存到: {filename}")
            
            raise UserError(f"{batch_type}数据生成失败: {str(parse_error)}")

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
      {{ "type": "context", "text": "[上下文线索]", "strength": 0 }},
      {{ "type": "synonym", "text": "[同义词]", "strength": 0 }},
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

    def _parse_batch_response(self, ai_response, batch_type):
        """Parse AI response for batch generation"""
        try:
            # Try to find JSON array in response
            json_match = re.search(r'\[.*\]', ai_response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                # Try to parse entire response as JSON array
                return json.loads(ai_response)
        except json.JSONDecodeError as e:
            raise UserError(f"AI {batch_type}响应格式错误，无法解析JSON数组: {str(e)}\n\n响应内容:\n{ai_response}")

    def _import_generated_data(self, json_data):
        """Import generated data to models with specific logic:
        - learning.set: update name and description
        - vocabulary, sentences, cue: add as new data (append)
        """
        try:
            # Get the first (and should be only) learning set data
            set_name = list(json_data.keys())[0]
            set_data = json_data[set_name]

            # Update learning.set name and description
            self.learning_set_id.write({
                'name': set_name,
                'description': set_data.get('description', set_name),
            })

            # Add new vocabulary data
            vocabulary_data = set_data.get('vocabulary', [])
            for vocab_item in vocabulary_data:
                vocab = self.env['learning.vocabulary'].create({
                    'learning_set_id': self.learning_set_id.id,
                    'word': vocab_item.get('word', ''),
                    'translation': vocab_item.get('translation', ''),
                    'example': vocab_item.get('example', ''),
                    'common_mistake': vocab_item.get('commonMistake', ''),
                    'lambda_value': vocab_item.get('lambda', 10),
                })

                # Add new cues for this vocabulary
                cues_data = vocab_item.get('cues', [])
                for cue_item in cues_data:
                    self.env['learning.cue'].create({
                        'vocabulary_id': vocab.id,
                        'cue_type_char': cue_item.get('type', 'context'),
                        'text': cue_item.get('text', ''),
                        'strength': cue_item.get('strength', 0.0),
                    })

            # Add new sentences data
            sentences_data = set_data.get('sentences', [])
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

            _logger.info(
                f"Successfully imported AI generated data: {len(vocabulary_data)} vocabulary items, {len(sentences_data)} sentences")

        except Exception as e:
            _logger.error(f"Failed to import generated data: {str(e)}")
            raise UserError(f"数据导入失败: {str(e)}")