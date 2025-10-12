from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError
import json
import base64
import requests


class LearningSet(models.Model):
    _name = 'learning.set'
    _description = 'Learning Set'
    _order = 'sequence, name'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char('Name', required=True, help="Internal name for the learning set", tracking=True)
    description = fields.Char('Description', required=True, help="Display name for users", tracking=True)
    full_text = fields.Text('Full Text', required=True, help="Complete text content for learning", tracking=True)
    user = fields.Char('User', default='public', help="Target user or user group")
    sequence = fields.Integer('Sequence', default=10, help="Display order")
    active = fields.Boolean('Active', default=True, tracking=True)
    
    # MP3 Audio file
    audio_file = fields.Binary('Audio File (MP3)', help="Upload MP3 audio file for this learning set")
    audio_filename = fields.Char('Audio Filename', help="Name of the uploaded audio file")
    audio_url = fields.Char('Audio URL', compute='_compute_audio_url', help="URL to access the audio file")
    
    # Related fields
    vocabulary_ids = fields.One2many('learning.vocabulary', 'learning_set_id', string='Vocabulary')
    sentence_ids = fields.One2many('learning.sentence', 'learning_set_id', string='Sentences')
    
    # Computed fields
    vocabulary_count = fields.Integer('Vocabulary Count', compute='_compute_counts', store=True)
    sentence_count = fields.Integer('Sentence Count', compute='_compute_counts', store=True)

    @api.depends('vocabulary_ids', 'sentence_ids')
    def _compute_counts(self):
        for record in self:
            record.vocabulary_count = len(record.vocabulary_ids)
            record.sentence_count = len(record.sentence_ids)

    @api.depends('audio_file', 'audio_filename')
    def _compute_audio_url(self):
        """Compute URL for accessing the audio file"""
        for record in self:
            if record.audio_file and record.audio_filename:
                base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
                # 使用公开的API接口访问音频文件，避免认证和CORS问题
                record.audio_url = f"{base_url}/api/learning/audio/{record.id}"
            else:
                record.audio_url = False

    @api.constrains('audio_file', 'audio_filename')
    def _check_audio_file(self):
        """Validate that uploaded file is MP3 format"""
        for record in self:
            if record.audio_file and record.audio_filename:
                if not record.audio_filename.lower().endswith('.mp3'):
                    raise ValidationError("只支持上传MP3格式的音频文件")

    def export_to_json(self):
        """Export learning set to JSON format compatible with React app"""
        result = {}
        for learning_set in self:
            # Export vocabulary
            vocabulary_data = []
            for vocab in learning_set.vocabulary_ids:
                cues_data = []
                for cue in vocab.cue_ids:
                    cues_data.append({
                        'type': cue.cue_type_char,
                        'text': cue.text,
                        'strength': cue.strength
                    })
                
                vocabulary_data.append({
                    'word': vocab.word,
                    'cues': cues_data,
                    'translation': vocab.translation,
                    'example': vocab.example,
                    'commonMistake': vocab.common_mistake,
                    'lambda': vocab.lambda_value
                })
            
            # Export sentences
            sentences_data = []
            for sentence in learning_set.sentence_ids:
                prediction_data = {
                    'question': sentence.prediction_question,
                    'wrongOptions': sentence.wrong_options.split('\n') if sentence.wrong_options else [],
                    'correctAnswer': sentence.correct_answer,
                    'explanation': sentence.explanation
                }
                
                grammar_breakdown = {}
                if sentence.grammar_breakdown:
                    try:
                        grammar_breakdown = json.loads(sentence.grammar_breakdown)
                    except:
                        grammar_breakdown = {}
                
                grammar_data = {
                    'pattern': sentence.grammar_pattern,
                    'breakdown': grammar_breakdown
                }
                
                sentences_data.append({
                    'id': sentence.sentence_id,
                    'title': sentence.title,
                    'sentence': sentence.sentence,
                    'prediction': prediction_data,
                    'grammar': grammar_data,
                    'lambda': sentence.lambda_value
                })
            
            # Combine all data
            result[learning_set.name] = {
                'fullText': learning_set.full_text,
                'description': learning_set.description,
                'user': learning_set.user,
                'audioUrl': learning_set.audio_url if learning_set.audio_url else None,
                'audioFilename': learning_set.audio_filename if learning_set.audio_filename else None,
                'vocabulary': vocabulary_data,
                'sentences': sentences_data
            }
        
        return result

    @api.model
    def get_learning_data_api(self):
        """API method to get all learning data in JSON format"""
        learning_sets = self.search([('active', '=', True)])
        return learning_sets.export_to_json()

    @api.model
    def import_from_json_data(self, json_data):
        """Import learning data from JSON format"""
        try:
            if isinstance(json_data, str):
                data = json.loads(json_data)
            else:
                data = json_data
            
            created_sets = []
            
            for set_name, set_data in data.items():
                # Check if learning set already exists
                existing_set = self.search([('name', '=', set_name)], limit=1)
                if existing_set:
                    raise UserError(f"学习集 '{set_name}' 已存在。请先删除现有数据或使用不同的名称。")
                
                # Create learning set
                learning_set = self.create({
                    'name': set_name,
                    'description': set_data.get('description', set_name),
                    'full_text': set_data.get('fullText', ''),
                    'user': set_data.get('user', 'public'),
                })
                
                # Import vocabulary
                vocabulary_data = set_data.get('vocabulary', [])
                for vocab_item in vocabulary_data:
                    vocab = self.env['learning.vocabulary'].create({
                        'learning_set_id': learning_set.id,
                        'word': vocab_item.get('word', ''),
                        'translation': vocab_item.get('translation', ''),
                        'example': vocab_item.get('example', ''),
                        'common_mistake': vocab_item.get('commonMistake', ''),
                        'lambda_value': vocab_item.get('lambda', 0.1),
                    })
                    
                    # Import cues for vocabulary
                    cues_data = vocab_item.get('cues', [])
                    for cue_item in cues_data:
                        self.env['learning.cue'].create({
                            'vocabulary_id': vocab.id,
                            'cue_type_char': cue_item.get('type', 'text'),
                            'text': cue_item.get('text', ''),
                            'strength': cue_item.get('strength', 1.0),
                        })
                
                # Import sentences
                sentences_data = set_data.get('sentences', [])
                for sentence_item in sentences_data:
                    prediction = sentence_item.get('prediction', {})
                    grammar = sentence_item.get('grammar', {})
                    
                    # Prepare wrong options
                    wrong_options = prediction.get('wrongOptions', [])
                    wrong_options_text = '\n'.join(wrong_options) if wrong_options else ''
                    
                    # Prepare grammar breakdown
                    grammar_breakdown = grammar.get('breakdown', {})
                    grammar_breakdown_json = json.dumps(grammar_breakdown, ensure_ascii=False) if grammar_breakdown else ''
                    
                    self.env['learning.sentence'].create({
                        'learning_set_id': learning_set.id,
                        'sentence_id': sentence_item.get('id', ''),
                        'title': sentence_item.get('title', ''),
                        'sentence': sentence_item.get('sentence', ''),
                        'prediction_question': prediction.get('question', ''),
                        'wrong_options': wrong_options_text,
                        'correct_answer': prediction.get('correctAnswer', ''),
                        'explanation': prediction.get('explanation', ''),
                        'grammar_pattern': grammar.get('pattern', ''),
                        'grammar_breakdown': grammar_breakdown_json,
                        'lambda_value': sentence_item.get('lambda', 0.1),
                    })
                
                created_sets.append(learning_set)
            
            return {
                'success': True,
                'message': f'成功导入 {len(created_sets)} 个学习集',
                'created_sets': [s.name for s in created_sets]
            }
            
        except json.JSONDecodeError as e:
            raise UserError(f"JSON 格式错误: {str(e)}")
        except Exception as e:
            raise UserError(f"导入失败: {str(e)}")

    def action_view_vocabulary(self):
        """Open vocabulary records for this learning set"""
        return {
            'type': 'ir.actions.act_window',
            'name': f'Vocabulary - {self.name}',
            'res_model': 'learning.vocabulary',
            'view_mode': 'tree,form',
            'domain': [('learning_set_id', '=', self.id)],
            'context': {
                'default_learning_set_id': self.id,
                'search_default_learning_set_id': self.id,
            },
            'target': 'current',
        }

    def action_view_sentences(self):
        """Open sentence records for this learning set"""
        return {
            'type': 'ir.actions.act_window',
            'name': f'Sentences - {self.name}',
            'res_model': 'learning.sentence',
            'view_mode': 'tree,form',
            'domain': [('learning_set_id', '=', self.id)],
            'context': {
                'default_learning_set_id': self.id,
                'search_default_learning_set_id': self.id,
            },
            'target': 'current',
        }

    def action_import_json_wizard(self):
        """Open JSON import wizard"""
        return {
            'name': '导入 JSON 学习数据',
            'type': 'ir.actions.act_window',
            'res_model': 'learning.import.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {'default_learning_set_id': self.id if len(self) == 1 else False}
        }

    def action_ai_generate_data(self):
        """Open AI data generation wizard"""
        if not self.full_text:
            raise UserError("请先填写完整文本内容(Full Text)才能使用AI生成功能")
        
        return {
            'name': 'AI 生成学习数据',
            'type': 'ir.actions.act_window',
            'res_model': 'learning.ai.generator',
            'view_mode': 'form',
            'view_id': self.env.ref('learning_system.view_ai_generator_form').id,
            'target': 'new',
            'context': {'default_learning_set_id': self.id}
        }

    def action_open_txt2audio(self):
        """Open txt2audio website in new window"""
        return {
            'type': 'ir.actions.act_url',
            'url': 'https://text2audio.cc/',
            'target': 'new',
        }

    def generate_txt2audio(self):
        """Generate audio using txt2audio API (internal method)"""
        if not self.full_text:
            raise UserError("请先填写完整文本内容(Full Text)才能使用语音生成功能")
        
        import logging
        _logger = logging.getLogger(__name__)
        
        try:
            _logger.info(f"开始为学习集 '{self.name}' 生成音频...")
            
            # Prepare API request
            url = "https://text2audio.cc/api/audio"
            headers = {"Content-Type": "application/json"}
            data = {
                "language": "en-US",
                "paragraphs": self.full_text,
                "splitParagraph": True
            }
            
            _logger.info(f"发送API请求到: {url}")
            
            # Make API request
            response = requests.post(url, json=data, headers=headers, timeout=30)
            response.raise_for_status()
            
            # Parse response
            audio_data = response.json()
            if not audio_data or not isinstance(audio_data, list) or not audio_data[0].get('url'):
                raise UserError("API返回数据格式错误")
            
            # Get the first audio URL
            audio_url = audio_data[0]['url']
            _logger.info(f"获取到音频URL: {audio_url}")
            
            # Download the MP3 file
            _logger.info("开始下载音频文件...")
            audio_response = requests.get(audio_url, timeout=60)
            audio_response.raise_for_status()
            
            # Encode audio content to base64
            audio_content = base64.b64encode(audio_response.content)
            
            # Generate filename
            filename = f"{self.name}.mp3"
            
            # Update the record
            self.write({
                'audio_file': audio_content,
                'audio_filename': filename
            })
            
            _logger.info(f"音频文件生成成功: {filename}, 大小: {len(audio_response.content)} 字节")
            
            return True
            
        except requests.exceptions.RequestException as e:
            _logger.error(f"API请求失败: {str(e)}")
            raise UserError(f"API请求失败: {str(e)}")
        except Exception as e:
            _logger.error(f"语音生成失败: {str(e)}")
            raise UserError(f"语音生成失败: {str(e)}")

    def action_generate_txt2audio(self):
        """Generate audio using txt2audio API (UI action)"""
        try:
            # 调用内部生成方法
            self.generate_txt2audio()
            
            # 返回UI动作
            return {
                'type': 'ir.actions.act_window',
                'name': '学习集',
                'res_model': 'learning.set',
                'res_id': self.id,
                'view_mode': 'form',
                'target': 'current',
                'context': {
                    **self.env.context,
                    'params': {
                        'notification': {
                            'type': 'success',
                            'title': '语音生成成功',
                            'message': f'语音文件已生成并保存为 {self.audio_filename}',
                        }
                    }
                }
            }
            
        except Exception as e:
            # 如果是UserError，直接抛出
            if isinstance(e, UserError):
                raise e
            # 其他异常包装为UserError
            raise UserError(f"语音生成失败: {str(e)}")