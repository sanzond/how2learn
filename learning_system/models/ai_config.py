from odoo import models, fields, api
from odoo.exceptions import UserError, ValidationError
import requests
import json
import logging

_logger = logging.getLogger(__name__)


class AIConfig(models.Model):
    _name = 'learning.ai.config'
    _description = 'AI API Configuration'
    _rec_name = 'provider_name'

    provider_name = fields.Char('Provider Name', required=True, help="AI服务提供商名称")
    provider_type = fields.Selection([
        ('openai', 'OpenAI (ChatGPT)'),
        ('gemini', 'Google Gemini'),
        ('deepseek', 'DeepSeek'),
        ('claude', 'Anthropic Claude'),
        ('custom', 'Custom API')
    ], string='Provider Type', required=True, default='openai')
    
    api_url = fields.Char('API URL', required=True, help="API接口地址")
    api_key = fields.Char('API Key', required=True, help="API密钥")
    model_name = fields.Char('Model Name', help="模型名称（如：gpt-4, gemini-pro）")
    
    timeout = fields.Integer('Timeout (seconds)', default=60, help="请求超时时间（秒）")
    max_tokens = fields.Integer('Max Tokens', default=4000, help="最大token数量")
    temperature = fields.Float('Temperature', default=0.7, help="生成温度（0-1）")
    
    active = fields.Boolean('Active', default=True)
    is_default = fields.Boolean('Default Provider', default=False, help="默认AI服务提供商")
    
    # Test fields
    test_status = fields.Selection([
        ('not_tested', 'Not Tested'),
        ('success', 'Success'),
        ('failed', 'Failed')
    ], string='Test Status', default='not_tested', readonly=True)
    test_message = fields.Text('Test Message', readonly=True)

    @api.constrains('is_default')
    def _check_default_provider(self):
        """Ensure only one default provider"""
        if self.is_default:
            other_defaults = self.search([('is_default', '=', True), ('id', '!=', self.id)])
            if other_defaults:
                raise ValidationError("只能设置一个默认AI服务提供商")

    def name_get(self):
        result = []
        for record in self:
            name = f"{record.provider_name} ({record.provider_type})"
            result.append((record.id, name))
        return result

    def test_connection(self):
        """Test AI API connection"""
        try:
            test_prompt = "请回复：连接测试成功"
            response = self._call_ai_api(test_prompt)
            
            if response:
                self.test_status = 'success'
                self.test_message = f"连接成功！响应：{response[:100]}..."
                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'title': '连接测试成功',
                        'message': 'AI API连接正常',
                        'type': 'success',
                    }
                }
            else:
                raise Exception("API返回空响应")
                
        except Exception as e:
            self.test_status = 'failed'
            self.test_message = f"连接失败：{str(e)}"
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': '连接测试失败',
                    'message': str(e),
                    'type': 'danger',
                }
            }

    def _call_ai_api(self, prompt):
        """Call AI API with given prompt"""
        try:
            if self.provider_type == 'openai':
                return self._call_openai_api(prompt)
            elif self.provider_type == 'gemini':
                return self._call_gemini_api(prompt)
            elif self.provider_type == 'deepseek':
                return self._call_deepseek_api(prompt)
            elif self.provider_type == 'claude':
                return self._call_claude_api(prompt)
            else:
                return self._call_custom_api(prompt)
        except Exception as e:
            _logger.error(f"AI API调用失败: {str(e)}")
            raise UserError(f"AI API调用失败: {str(e)}")

    def _call_openai_api(self, prompt):
        """Call OpenAI API"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': self.model_name or 'gpt-3.5-turbo',
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'max_tokens': self.max_tokens,
            'temperature': self.temperature
        }
        
        response = requests.post(
            self.api_url,
            headers=headers,
            json=data,
            timeout=self.timeout
        )
        response.raise_for_status()
        
        result = response.json()
        return result['choices'][0]['message']['content']

    def _call_gemini_api(self, prompt):
        """Call Google Gemini API"""
        headers = {
            'Content-Type': 'application/json'
        }
        
        url = f"{self.api_url}?key={self.api_key}"
        
        data = {
            'contents': [{
                'parts': [{'text': prompt}]
            }],
            'generationConfig': {
                'maxOutputTokens': self.max_tokens,
                'temperature': self.temperature
            }
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=self.timeout)
        response.raise_for_status()
        
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']

    def _call_deepseek_api(self, prompt):
        """Call DeepSeek API"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': self.model_name or 'deepseek-chat',
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'max_tokens': self.max_tokens,
            'temperature': self.temperature
        }
        
        response = requests.post(
            self.api_url,
            headers=headers,
            json=data,
            timeout=self.timeout
        )
        response.raise_for_status()
        
        result = response.json()
        return result['choices'][0]['message']['content']

    def _call_claude_api(self, prompt):
        """Call Anthropic Claude API"""
        headers = {
            'x-api-key': self.api_key,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        
        data = {
            'model': self.model_name or 'claude-3-sonnet-20240229',
            'max_tokens': self.max_tokens,
            'temperature': self.temperature,
            'messages': [
                {'role': 'user', 'content': prompt}
            ]
        }
        
        response = requests.post(
            self.api_url,
            headers=headers,
            json=data,
            timeout=self.timeout
        )
        response.raise_for_status()
        
        result = response.json()
        return result['content'][0]['text']

    def _call_custom_api(self, prompt):
        """Call custom API"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'prompt': prompt,
            'max_tokens': self.max_tokens,
            'temperature': self.temperature
        }
        
        response = requests.post(
            self.api_url,
            headers=headers,
            json=data,
            timeout=self.timeout
        )
        response.raise_for_status()
        
        result = response.json()
        # 假设自定义API返回格式为 {'response': 'content'}
        return result.get('response', result.get('content', str(result)))

    @api.model
    def get_default_provider(self):
        """Get default AI provider"""
        default_provider = self.search([('is_default', '=', True), ('active', '=', True)], limit=1)
        if not default_provider:
            default_provider = self.search([('active', '=', True)], limit=1)
        return default_provider